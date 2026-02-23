import { BaseSeeder } from '@adonisjs/lucid/seeders'
import FlightStatus from '#models/flight_status'
import TravelClass from '#models/travel_class'

export default class extends BaseSeeder {
  async run() {
    await FlightStatus.createMany([
      { name: 'Scheduled' },
      { name: 'Delayed' },
      { name: 'Departed' },
      { name: 'Arrived' },
      { name: 'Cancelled' },
    ])

    await TravelClass.createMany([
      { name: 'Economy', description: 'Standard economy class' },
      { name: 'Business', description: 'Premium business class' },
      { name: 'First Class', description: 'Luxury first class' },
    ])
  }
}