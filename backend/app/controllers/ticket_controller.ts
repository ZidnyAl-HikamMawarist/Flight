import type { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking'
import TicketService from '#services/ticket_service'
import QRCode from 'qrcode'

export default class TicketController {
    /**
     * Generate QR Code data for a booking
     */
    async generateQR({ params, response }: HttpContext) {
        const booking = await Booking.query()
            .where('booking_id', params.id)
            .preload('client')
            .preload('flight', (f) => {
                f.preload('schedule', (s) => {
                    s.preload('originAirport')
                    s.preload('destinationAirport')
                })
            })
            .first()

        if (!booking) {
            return response.notFound({ message: 'Booking not found' })
        }

        // Format Passenger Name: LAST/FIRST
        const firstName = booking.client.firstName || ''
        const lastName = booking.client.lastName || 'PAS'
        const passengerName = `${lastName}/${firstName}`.toUpperCase()

        // Flight Info
        const flightNo = booking.flightCall
        const origin = booking.flight.schedule?.originAirport?.iataAirportCode || '???'
        const destination = booking.flight.schedule?.destinationAirport?.iataAirportCode || '???'

        // Construct IATA-like barcode string
        // Standard BCBP format-ish but simplified for our demo
        const qrData = [
            `NAME: ${passengerName}`,
            `FLIGHT: ${flightNo}`,
            `ROUTE: ${origin}-${destination}`,
            `PNR: ${booking.bookingCode}`,
            `SEAT: ${booking.seatId}`,
            `SEQ: ${String(booking.sequenceNumber || 0).padStart(3, '0')}`,
            `TICKET: ${booking.ticketNumber}`
        ].join('\n')

        try {
            const qrImage = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 300,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff'
                }
            })

            return response.ok({
                qrCode: qrImage,
                rawContent: qrData
            })
        } catch (err) {
            return response.internalServerError({ message: 'Failed to generate QR Code' })
        }
    }

    /**
     * Download E-Ticket as PDF
     */
    async downloadPDF({ params, response }: HttpContext) {
        const booking = await Booking.query()
            .where('booking_id', params.id)
            .preload('client')
            .preload('flight', (f) => {
                f.preload('schedule', (s) => {
                    s.preload('originAirport')
                    s.preload('destinationAirport')
                })
            })
            .first()

        if (!booking) {
            return response.notFound({ message: 'Booking not found' })
        }

        try {
            const ticketService = new TicketService()
            const pdfBuffer = await ticketService.generatePdfBuffer(booking)

            response.header('Content-type', 'application/pdf')
            response.header('Content-Disposition', `attachment; filename=E-Ticket-${booking.bookingCode}.pdf`)
            return response.send(pdfBuffer)
        } catch (err) {
            console.error(err)
            return response.internalServerError({ message: 'Failed to generate PDF' })
        }
    }

    /**
     * Send E-Ticket via Email
     */
    async sendEmail({ params, response }: HttpContext) {
        const booking = await Booking.query()
            .where('booking_id', params.id)
            .preload('client')
            .preload('flight', (f) => {
                f.preload('schedule', (s) => {
                    s.preload('originAirport')
                    s.preload('destinationAirport')
                })
            })
            .first()

        if (!booking) {
            return response.notFound({ message: 'Booking not found' })
        }

        try {
            const ticketService = new TicketService()
            await ticketService.sendTicketEmail(booking)
            return response.ok({ message: 'Email sent successfully' })
        } catch (err) {
            console.error(err)
            return response.internalServerError({ message: 'Failed to send email' })
        }
    }
}
