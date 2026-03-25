import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const AircraftManufacturer = (await import('#models/aircraft_manufacturer')).default
    const Aircraft = (await import('#models/aircraft')).default
    const AircraftSeat = (await import('#models/aircraft_seat')).default
    const TravelClass = (await import('#models/travel_class')).default

    // 1. Manufacturers
    const boeing = await AircraftManufacturer.updateOrCreate({ name: 'Boeing' }, { name: 'Boeing' })
    const airbus = await AircraftManufacturer.updateOrCreate({ name: 'Airbus' }, { name: 'Airbus' })

    // 2. Aircraft Models
    const models = [
      { model: '737-800', manufacturerId: boeing.aircraftManufacturerId },
      { model: 'A320neo', manufacturerId: airbus.aircraftManufacturerId },
    ]

    const classes = await TravelClass.all()
    const classMap = classes.reduce((acc, c) => ({ ...acc, [c.name]: c.travelClassId }), {} as Record<string, number>)

    for (const m of models) {
      const aircraft = await Aircraft.updateOrCreate(
        { model: m.model },
        { aircraftManufacturerId: m.manufacturerId }
      )

      // 3. Simple Seats (Rows 1-5)
      for (let row = 1; row <= 5; row++) {
        for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
          const seatId = `${row}${col}`
          let travelClassId = classMap['Economy']
          if (row === 1) travelClassId = classMap['First Class']
          else if (row === 2) travelClassId = classMap['Business']

          await AircraftSeat.updateOrCreate(
            { aircraftId: aircraft.aircraftId, seatId },
            { travelClassId }
          )
        }
      }
    }
  }
}