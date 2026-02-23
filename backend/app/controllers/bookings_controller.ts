import type { HttpContext } from '@adonisjs/core/http'
import FlightSeatPrice from '#models/flight_seat_price'
import Booking from '#models/booking'
import Client from '#models/client'
import { DateTime } from 'luxon'

export default class BookingsController {
  /**
   * Ambil semua kursi dan statusnya untuk penerbangan tertentu
   */
  async seats({ params, response }: HttpContext) {
    const flightCall = params.flightCall

    // 1. Ambil semua kursi, harga, dan kelas untuk flight ini
    const seats = await FlightSeatPrice.query()
      .where('flight_call', flightCall)
      .join('aircraft_seats', (query) => {
        query
          .on('flight_seat_prices.aircraft_id', '=', 'aircraft_seats.aircraft_id')
          .andOn('flight_seat_prices.seat_id', '=', 'aircraft_seats.seat_id')
      })
      .join('travel_classes', 'aircraft_seats.travel_class_id', '=', 'travel_classes.travel_class_id')
      .select('flight_seat_prices.*')
      .select('travel_classes.name as class_name')

    // 2. Ambil booking yang sudah ada untuk flight ini
    const bookings = await Booking.query()
      .where('flight_call', flightCall)
      .select('seat_id')

    const occupiedSeats = bookings.map(b => {
      // @ts-ignore
      return b.seatId || (b.$attributes && b.$attributes.seat_id) || null
    }).filter(Boolean)

    // 3. Gabungkan data
    const result = seats.map(s => ({
      seatId: s.seatId,
      price: s.priceUsd,
      aircraftId: s.aircraftId,
      className: s.$extras.class_name,
      isAvailable: !occupiedSeats.includes(s.seatId)
    }))

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

    return response.ok({
      message: 'Pembayaran berhasil!',
      booking
    })
  }

  /**
   * Proses Booking
   */
  async store({ request, response }: HttpContext) {
    // Support two payload shapes:
    // 1) legacy single booking: { flightCall, aircraftId, seatId, passenger }
    // 2) batch booking: { flightCall, bookings: [{ aircraftId, seatId, passenger }, ...] }
    const payload = request.all()

    const items = payload.bookings && Array.isArray(payload.bookings)
      ? payload.bookings
      : [{ aircraftId: payload.aircraftId, seatId: payload.seatId, passenger: payload.passenger }]

    try {
      const created: any[] = []

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
          seatId: it.seatId
        })

        created.push(booking)
      }

      return response.created({
        message: 'Booking berhasil!',
        bookings: created
      })
    } catch (error) {
      console.error(error)
      return response.badRequest({ message: 'Gagal melakukan booking', error: error.message })
    }
  }
}