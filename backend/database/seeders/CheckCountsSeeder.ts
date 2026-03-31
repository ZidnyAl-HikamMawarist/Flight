import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Airport from '#models/airport'
import Flight from '#models/flight'

export default class extends BaseSeeder {
  async run() {
    const airports = await Airport.all()
    const flights = await Flight.query().preload('schedule')
    console.log(`TOTAL_AIRPORTS: ${airports.length}`)
    console.log(`TOTAL_FLIGHTS: ${flights.length}`)
    
    const flightsByOrigin = flights.reduce((acc, f) => {
        const origin = f.schedule?.originIataAirportCode || 'UNKNOWN'
        acc[origin] = (acc[origin] || 0) + 1
        return acc
    }, {} as Record<string, number>)
    
    console.log('FLIGHTS_BY_ORIGIN:', JSON.stringify(flightsByOrigin))
  }
}
