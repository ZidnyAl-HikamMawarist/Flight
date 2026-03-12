import Booking from '#models/booking'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import puppeteer from 'puppeteer'
import edge from 'edge.js'
import { DateTime } from 'luxon'
import QRCode from 'qrcode'

export default class TicketService {
    /**
     * Render HTML for the ticket
     */
    private async renderTicketHtml(booking: Booking): Promise<string> {
        // Generate QR Code for PDF (Base64)
        const passengerName = `${booking.client.lastName}/${booking.client.firstName}`.toUpperCase()
        const qrData = [
            `NAME: ${passengerName}`,
            `FLIGHT: ${booking.flightCall}`,
            `ROUTE: ${booking.flight.schedule.originAirport.iataAirportCode}-${booking.flight.schedule.destinationAirport.iataAirportCode}`,
            `PNR: ${booking.bookingCode}`,
            `SEAT: ${booking.seatId}`,
            `SEQ: ${String(booking.sequenceNumber).padStart(3, '0')}`,
            `TICKET: ${booking.ticketNumber}`
        ].join('\n')

        const qrImage = await QRCode.toDataURL(qrData)

        // Format Dates
        const departure = booking.flight.schedule.departureTimeGmt
        const departureDate = DateTime.fromJSDate(departure.toJSDate()).toFormat('dd LLL yyyy')
        const departureTime = DateTime.fromJSDate(departure.toJSDate()).toFormat('HH:mm')

        // Mount Edge and point to views directory
        edge.mount(app.makePath('resources/views'))

        return edge.render('pdf/ticket', {
            booking,
            qrCode: qrImage,
            departureDate,
            departureTime
        })
    }

    /**
     * Generate PDF Buffer
     */
    public async generatePdfBuffer(booking: Booking): Promise<Buffer> {
        const html = await this.renderTicketHtml(booking)

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        })

        await browser.close()
        return Buffer.from(pdfBuffer)
    }

    /**
     * Send Ticket via Email
     */
    public async sendTicketEmail(booking: Booking) {
        const pdfBuffer = await this.generatePdfBuffer(booking)
        const pnr = booking.bookingCode

        // Render email body manually to avoid Template Engine dependency in Mail service
        const emailHtml = await this.renderTicketHtmlForEmail(booking)

        await mail.send((message) => {
            message
                .to(booking.client.email)
                .subject(`E-Ticket [${pnr}] - ${booking.flightCall}`)
                .html(emailHtml)
                .attachData(pdfBuffer, {
                    filename: `E-Ticket-${pnr}.pdf`,
                    contentType: 'application/pdf'
                })
        })
    }

    /**
     * Helper to render email HTML
     */
    private async renderTicketHtmlForEmail(booking: Booking): Promise<string> {
        edge.mount(app.makePath('resources/views'))
        return edge.render('emails/ticket', { booking })
    }
}
