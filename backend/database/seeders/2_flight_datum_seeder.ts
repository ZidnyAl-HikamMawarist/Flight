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

    // Clean up old dynamic data to prevent "stale" flights (like old Singapore hardcoded ones)
    // from dominating the data if the user re-seeds.
    // We only wipe Flights and Schedules to keep the Master Data (Airports, etc) intact.
    await Flight.query().delete()
    await Schedule.query().delete()

    // 6. Generate dynamic routes from all available airports
    const allAirports = await Airport.all()
    const routes = []
    
    // Create routes combining all existing airports in both directions
    for(let i = 0; i < allAirports.length; i++) {
        for(let j = i + 1; j < allAirports.length; j++) {
            routes.push({ o: allAirports[i].iataAirportCode, d: allAirports[j].iataAirportCode })
            routes.push({ o: allAirports[j].iataAirportCode, d: allAirports[i].iataAirportCode })
        }
    }
    
    // Shuffle routes so that the first page of results isn't dominated by a single city
    const activeRoutes = routes.sort(() => 0.5 - Math.random());

    // Fetch actual aircraft records to get valid integer IDs
    const allAircrafts = await Aircraft.all()

    const carriers = [
      { prefix: 'GA', start: 401 },
      { prefix: 'SQ', start: 951 },
      { prefix: 'AK', start: 701 },
      { prefix: 'QZ', start: 201 },
      { prefix: 'JT', start: 301 },
    ]

    const base = DateTime.now().startOf('day').plus({ days: 1 })
    let flightIndex = 0

    // Schedule flights over 14 days
    for (let day = 0; day < 14; day++) {
      for (let r = 0; r < activeRoutes.length; r++) {
        const route = activeRoutes[r]

        const departHour = 6 + ((r * 2 + day) % 12) // 06.00 - 17.00
        const depart = base.plus({ days: day, hours: departHour })
        const durationHours = 1 + ((r + day) % 3) // 1-3 hours trip
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

        // Generate a more diverse set of flight calls to clearly show different airlines
        const carrier = carriers[flightIndex % carriers.length]
        // Unique ID format: Carrier-Day-Index to ensure no collisions
        const flightCall = `${carrier.prefix}-${400 + (day * 100) + r}`

        const selectedAircraft = allAircrafts[flightIndex % allAircrafts.length]

        await Flight.create({
            flightCall,
            scheduleId: schedule.scheduleId,
            flightStatusId: statusScheduled.flightStatusId,
            aircraftId: selectedAircraft.aircraftId
        })

        flightIndex++
      }
    }
  }
}
