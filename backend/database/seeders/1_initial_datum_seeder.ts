import { BaseSeeder } from '@adonisjs/lucid/seeders'
import FlightStatus from '#models/flight_status'
import TravelClass from '#models/travel_class'

export default class extends BaseSeeder {
  async run() {
    const statuses = ['Scheduled', 'Delayed', 'Departed', 'Arrived', 'Cancelled']
    for (const name of statuses) {
      await FlightStatus.updateOrCreate({ name }, { name })
    }

    const classes = [
      { name: 'Economy', description: 'Standard economy class' },
      { name: 'Premium Economy', description: 'Extra legroom and comfort' },
      { name: 'Business', description: 'Premium business class' },
      { name: 'First Class', description: 'Luxury first class' },
    ]
    for (const c of classes) {
      await TravelClass.updateOrCreate({ name: c.name }, c)
    }
  }
}