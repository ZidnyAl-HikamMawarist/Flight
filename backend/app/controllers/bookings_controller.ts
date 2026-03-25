import type { HttpContext } from '@adonisjs/core/http'
import FlightSeatPrice from '#models/flight_seat_price'
import Booking from '#models/booking'
import Flight from '#models/flight'
import Client from '#models/client'
import { DateTime } from 'luxon'

export default class BookingsController {
  /**
   * Ambil semua kursi dan statusnya untuk penerbangan tertentu
   */
  async seats({ params, response }: HttpContext) {
    const flightCall = params.flightCall

    // 1. Ambil data flight untuk mendapatkan aircraft_id
    const flight = await Flight.findOrFail(flightCall)
    const aircraftId = flight.aircraftId

    // 2. Ambil semua kursi, harga, dan kelas untuk flight ini (hanya untuk aircraft yang sesuai)
    const seats = await FlightSeatPrice.query()
      .where('flight_call', flightCall)
      .where('flight_seat_prices.aircraft_id', aircraftId)
      .join('aircraft_seats', (query) => {
        query
          .on('flight_seat_prices.aircraft_id', '=', 'aircraft_seats.aircraft_id')
          .andOn('flight_seat_prices.seat_id', '=', 'aircraft_seats.seat_id')
      })
      .join('travel_classes', 'aircraft_seats.travel_class_id', '=', 'travel_classes.travel_class_id')
      .select('flight_seat_prices.*')
      .select('travel_classes.name as class_name')

    // 2. Ambil booking yang sudah ada untuk flight ini, preload client untuk inisial
    const bookings = await Booking.query()
      .where('flight_call', flightCall)
      .preload('client')

    // 3. Gabungkan data
    const result = seats.map(s => {
      const b = bookings.find(book => book.seatId === s.seatId)
      let initials = null

      if (b && b.client) {
        const first = b.client.firstName ? b.client.firstName[0] : ''
        const last = b.client.lastName ? b.client.lastName[0] : ''
        initials = (first + last).toUpperCase()

        // Fallback jika lastName kosong
        if (!initials && b.client.firstName) {
          initials = b.client.firstName.substring(0, 2).toUpperCase()
        }
      }

      return {
        seatId: s.seatId,
        price: s.priceUsd,
        aircraftId: s.aircraftId,
        className: s.$extras.class_name,
        isAvailable: !b,
        passengerInitials: initials
      }
    })

    return response.ok(result)
  }

  /**
   * Riwayat Booking berdasarkan email user
   */
  async history({ request, response }: HttpContext) {
    const email = request.qs().email

    if (!email) {
      return response.badRequest({ message: 'Email diperlukan' })
    }

    // Cari client berdasarkan email (case-insensitive)
    const client = await Client.query()
      .whereRaw('lower(email) = ?', [email.toLowerCase()])
      .first()
    if (!client) {
      return response.ok([]) // Belum pernah booking
    }

    const bookings = await Booking.query()
      .where('client_id', client.clientId)
      .preload('flight', (f) => {
        f.preload('schedule', (s) => {
          s.preload('originAirport')
          s.preload('destinationAirport')
        })
        f.preload('status')
      })
      .orderBy('created_at', 'desc')

    return response.ok(bookings)
  }

  /**
   * Tampilkan detail booking berdasarkan id
   */
  async show({ params, response }: HttpContext) {
    const id = params.id

    const booking = await Booking.query()
      .where('booking_id', id)
      .preload('flight', (f) => {
        f.preload('schedule', (s) => {
          s.preload('originAirport')
          s.preload('destinationAirport')
        })
        f.preload('status')
      })
      .preload('client')
      .first()

    if (!booking) {
      return response.notFound({ message: 'Booking tidak ditemukan' })
    }

    return response.ok(booking)
  }

  /**
   * Hapus/cancel booking
   */
  async destroy({ params, response }: HttpContext) {
    const id = params.id

    const booking = await Booking.find(id)
    if (!booking) {
      return response.notFound({ message: 'Booking tidak ditemukan' })
    }

    await booking.delete()
    return response.ok({ message: 'Booking dibatalkan' })
  }

  /**
   * Simulasi Pembayaran
   */
  async pay({ params, request, response }: HttpContext) {
    const id = params.id
    const { paymentMethod } = request.all()

    if (!paymentMethod) {
      return response.badRequest({ message: 'Metode pembayaran diperlukan' })
    }

    const booking = await Booking.find(id)
    if (!booking) {
      return response.notFound({ message: 'Booking tidak ditemukan' })
    }

    if (booking.paymentStatus === 'paid') {
      return response.badRequest({ message: 'Booking ini sudah dibayar' })
    }

    booking.paymentStatus = 'paid'
    booking.paymentMethod = paymentMethod
    booking.paidAt = DateTime.now()
    await booking.save()

    // OTOMATISASI: Kirim E-Ticket ke email setelah pembayaran sukses
    try {
      // Kita perlu preload data lengkap untuk kebutuhan TicketService
      await booking.load('client')
      await booking.load('flight', (f) => {
        f.preload('schedule', (s) => {
          s.preload('originAirport')
          s.preload('destinationAirport')
        })
      })

      const ticketService = new (await import('#services/ticket_service')).default()
      // Kita jalankan tanpa 'await' (Background-ish) supaya response bayar tetap cepat
ticketService.sendTicketEmail(booking).catch(err => {
        // Silent fail for production - email delivery issues logged by mail service
      })
    } catch (err) {
      console.error('Failed to trigger auto-email:', err)
    }

    return response.ok({
      message: 'Pembayaran berhasil dan E-Ticket sedang dikirim!',
      booking
    })
  }

  /**
   * Proses Booking
   */
  async store({ request, response }: HttpContext) {
    const payload = request.all()
    const items = payload.bookings && Array.isArray(payload.bookings)
      ? payload.bookings
      : [{ aircraftId: payload.aircraftId, seatId: payload.seatId, passenger: payload.passenger }]

    try {
      const created: any[] = []

      // Helper functions for code generation
      const generatePNR = () => Math.random().toString(36).substring(2, 8).toUpperCase()
      const generateTicketNo = () => "126" + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')

      // Get initial sequence count for this flight
      const lastBooking = await Booking.query()
        .where('flight_call', payload.flightCall)
        .orderBy('sequence_number', 'desc')
        .first()

      let nextSeq = (lastBooking?.sequenceNumber || 0) + 1

      for (const it of items) {
        const passenger = it.passenger

        // 1. Simpan/Cek data Client
        const client = await Client.updateOrCreate(
          { email: passenger.email },
          {
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            phone: passenger.phone,
            iataCountryCode: 'ID' // Default
          }
        )

        // 2. Buat Booking
        const booking = await Booking.create({
          clientId: client.clientId,
          flightCall: payload.flightCall,
          aircraftId: it.aircraftId,
          seatId: it.seatId,
          bookingCode: generatePNR(),
          ticketNumber: generateTicketNo(),
          sequenceNumber: nextSeq++
        })

        created.push(booking)
      }

      return response.created({
        message: 'Booking berhasil!',
        bookings: created
      })
    } catch (error) {
// Log error via proper logger in production

      return response.badRequest({ message: 'Gagal melakukan booking', error: error.message })
    }
  }
}