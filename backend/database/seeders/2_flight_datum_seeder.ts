import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Country from '#models/country'
import Airport from '#models/airport'
import AircraftManufacturer from '#models/aircraft_manufacturer'
import Aircraft from '#models/aircraft'
import FlightStatus from '#models/flight_status'
import Schedule from '#models/schedule'
import Flight from '#models/flight'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // 1. Seed Countries
    await Country.updateOrCreate({ iataCountryCode: 'ID' }, { name: 'Indonesia' })
    await Country.updateOrCreate({ iataCountryCode: 'SG' }, { name: 'Singapore' })
    await Country.updateOrCreate({ iataCountryCode: 'MY' }, { name: 'Malaysia' })
    await Country.updateOrCreate({ iataCountryCode: 'TH' }, { name: 'Thailand' })

    // 2. Seed Manufacturers
    const boeing = await AircraftManufacturer.updateOrCreate({ name: 'Boeing' }, { name: 'Boeing' })
    const airbus = await AircraftManufacturer.updateOrCreate({ name: 'Airbus' }, { name: 'Airbus' })

    // 3. Seed Airports
    await Airport.updateOrCreate({ iataAirportCode: 'CGK' }, {
      name: 'Soekarno-Hatta International', city: 'Jakarta', iataCountryCode: 'ID'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'SUB' }, {
      name: 'Juanda International', city: 'Surabaya', iataCountryCode: 'ID'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'DPS' }, {
      name: 'Ngurah Rai International', city: 'Bali', iataCountryCode: 'ID'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'SIN' }, {
      name: 'Changi Airport', city: 'Singapore', iataCountryCode: 'SG'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'KUL' }, {
      name: 'Kuala Lumpur International', city: 'Kuala Lumpur', iataCountryCode: 'MY'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'BKK' }, {
      name: 'Suvarnabhumi Airport', city: 'Bangkok', iataCountryCode: 'TH'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'YIA' }, {
      name: 'Yogyakarta International', city: 'Yogyakarta', iataCountryCode: 'ID'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'UPG' }, {
      name: 'Sultan Hasanuddin International', city: 'Makassar', iataCountryCode: 'ID'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'KNO' }, {
      name: 'Kualanamu International', city: 'Medan', iataCountryCode: 'ID'
    })
    await Airport.updateOrCreate({ iataAirportCode: 'BDO' }, {
      name: 'Husein Sastranegara', city: 'Bandung', iataCountryCode: 'ID'
    })

    // 4. Seed Aircrafts (Tanpa variabel tidak terpakai agar tidak error lint)
    await Aircraft.updateOrCreate({ model: '737-800' }, {
      aircraftManufacturerId: boeing.aircraftManufacturerId, model: '737-800'
    })
    await Aircraft.updateOrCreate({ model: 'A320neo' }, {
      aircraftManufacturerId: airbus.aircraftManufacturerId, model: 'A320neo'
    })
    await Aircraft.updateOrCreate({ model: '787-9' }, {
      aircraftManufacturerId: boeing.aircraftManufacturerId, model: '787-9'
    })
    await Aircraft.updateOrCreate({ model: 'A330-300' }, {
      aircraftManufacturerId: airbus.aircraftManufacturerId, model: 'A330-300'
    })

    // 5. Get Status
    const statusScheduled = await FlightStatus.findByOrFail('name', 'Scheduled')

    // 6. Seed Schedules & Flights (banyak data)
    const routes = [
      { o: 'CGK', d: 'DPS' },
      { o: 'CGK', d: 'SUB' },
      { o: 'CGK', d: 'SIN' },
      { o: 'CGK', d: 'KUL' },
      { o: 'CGK', d: 'BKK' },
      { o: 'SUB', d: 'DPS' },
      { o: 'SUB', d: 'UPG' },
      { o: 'DPS', d: 'SIN' },
      { o: 'DPS', d: 'KUL' },
      { o: 'YIA', d: 'CGK' },
      { o: 'BDO', d: 'CGK' },
      { o: 'KNO', d: 'CGK' },
    ]

    const carriers = [
      { prefix: 'GA', start: 401 },
      { prefix: 'SQ', start: 951 },
      { prefix: 'AK', start: 701 },
    ]

    const base = DateTime.now().startOf('day').plus({ days: 1 })
    let flightIndex = 0

    for (let day = 0; day < 14; day++) {
      for (let r = 0; r < routes.length; r++) {
        const route = routes[r]

        const departHour = 6 + ((r * 2 + day) % 12) // 06.00 - 17.00
        const depart = base.plus({ days: day, hours: departHour })
        const durationHours = 1 + ((r + day) % 3) // 1-3 jam
        const arrive = depart.plus({ hours: durationHours, minutes: 15 })

        const schedule = await Schedule.updateOrCreate(
          {
            originIataAirportCode: route.o,
            destIataAirportCode: route.d,
            departureTimeGmt: depart,
          },
          {
            arrivalTimeGmt: arrive,
          }
        )

        const carrier = carriers[flightIndex % carriers.length]
        const flightCall = `${carrier.prefix}-${carrier.start + (flightIndex % 200)}`

        await Flight.updateOrCreate(
          { flightCall },
          { scheduleId: schedule.scheduleId, flightStatusId: statusScheduled.flightStatusId }
        )

        flightIndex++
      }
    }
  }
}
