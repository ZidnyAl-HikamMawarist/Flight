import Flight from '#models/flight'
import Airport from '#models/airport'
import type { HttpContext } from '@adonisjs/core/http'

export default class FlightsController {
  /**
   * Cari penerbangan
   */
  async index({ request, response }: HttpContext) {
    const { origin, destination } = request.qs()

    const query = Flight.query()
      .preload('schedule', (s) => {
        s.preload('originAirport')
        s.preload('destinationAirport')
      })
      .preload('status')
      .select('flights.*')
      .leftJoin('flight_seat_prices', 'flights.flight_call', 'flight_seat_prices.flight_call')
      .groupBy('flights.flight_call')
      .min('flight_seat_prices.price_usd as min_price')

    if (origin) {
      query.whereHas('schedule', (s) => {
        s.where('origin_iata_airport_code', origin)
      })
    }

    if (destination) {
      query.whereHas('schedule', (s) => {
        s.where('dest_iata_airport_code', destination)
      })
    }

    const flights = await query

    // Transform to include minPrice from extras
    const result = flights.map((flight) => {
      const data = flight.serialize()
      data.minPrice = flight.$extras.min_price
      return data
    })

    return response.ok(result)
  }

  /**
   * Ambil daftar bandara untuk dropdown
   */
  /**
   * Ambil daftar bandara untuk dropdown
   * Jika ada ?from=XXX, hanya return destinasi yang tersedia dari XXX
   */
  async airports({ request, response }: HttpContext) {
    const { from } = request.qs()

    if (from) {
      // Cari jadwal schedule dimana origin = from
      // Lalu ambil data destinationAirport
      const destinations = await Airport.query()
        .whereIn('iata_airport_code', (subquery) => {
          subquery
            .select('dest_iata_airport_code')
            .from('schedules')
            .where('origin_iata_airport_code', from)
        })

      return response.ok(destinations)
    }

    const airports = await Airport.all()
    return response.ok(airports)
  }
}