import Booking from '#models/booking'

export default class extends Object {
    public async run() {
        const bookings = await Booking.query().whereNull('booking_code')

        for (const b of bookings) {
            b.bookingCode = Math.random().toString(36).substring(2, 8).toUpperCase()
            b.ticketNumber = "126" + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')

            const last = await Booking.query()
                .where('flight_call', b.flightCall)
                .whereNotNull('sequence_number')
                .orderBy('sequence_number', 'desc')
                .first()

            b.sequenceNumber = (last?.sequenceNumber || 0) + 1
            await b.save()
        }

        console.log(`Updated ${bookings.length} bookings with codes.`)
    }
}
