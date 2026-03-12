import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Aircraft from '#models/aircraft'
import TravelClass from '#models/travel_class'
import AircraftSeat from '#models/aircraft_seat'
import FlightSeatPrice from '#models/flight_seat_price'
import Flight from '#models/flight'

/**
 * Referensi harga tiket pesawat domestik Indonesia 2024/2025 (Traveloka, Tiket.com, Skyscanner):
 *
 * Economy class:
 *   - Short haul  (< 1 jam)   : Rp 450.000 – Rp 900.000
 *   - Medium haul (1–2 jam)   : Rp 750.000 – Rp 1.600.000
 *   - Long haul   (> 2 jam)   : Rp 1.200.000 – Rp 2.200.000
 *
 * Business class (biasanya 2–3x Economy):
 *   - Short haul  : Rp 1.200.000 – Rp 2.000.000
 *   - Medium haul : Rp 2.000.000 – Rp 4.000.000
 *   - Long haul   : Rp 3.500.000 – Rp 7.000.000
 */

// Rentang harga realistis (Rupiah) per kelas
const PRICE_RANGES = {
  economy: [
    [450_000, 700_000], [700_000, 1_100_000], [1_100_000, 1_800_000], [1_500_000, 2_200_000]
  ],
  premium: [
    [900_000, 1_300_000], [1_300_000, 1_900_000], [1_900_000, 2_800_000], [2_500_000, 3_500_000]
  ],
  business: [
    [1_800_000, 3_000_000], [3_000_000, 4_500_000], [4_500_000, 6_500_000], [6_500_000, 9_500_000]
  ],
  first: [
    [5_000_000, 8_000_000], [8_000_000, 12_000_000], [12_000_000, 18_000_000], [18_000_000, 25_000_000]
  ],
}

/** Pilih angka bulat acak dalam [min, max] yang dibulatkan ke ribuan terdekat */
function randomRounded(min: number, max: number): number {
  const raw = Math.floor(Math.random() * (max - min + 1)) + min
  return Math.round(raw / 1000) * 1000
}

export default class extends BaseSeeder {
  async run() {
    const aircrafts = await Aircraft.all()
    const economy = await TravelClass.findByOrFail('name', 'Economy')
    const premium = await TravelClass.findByOrFail('name', 'Premium Economy')
    const business = await TravelClass.findByOrFail('name', 'Business')
    const first = await TravelClass.findByOrFail('name', 'First Class')
    const flights = await Flight.all()

    console.log(`🚀 Starting Optimized 4-Class Seeding for ${flights.length} flights...`)

    let flightCounter = 0
    for (const flight of flights) {
      // Pick one aircraft per flight to be realistic and fast
      const airplane = aircrafts[flightCounter % aircrafts.length]
      flightCounter++

      // SAVE THE AIRCRAFT TO THE FLIGHT RECORD
      flight.aircraftId = airplane.aircraftId
      await flight.save()

      const isLarge = airplane.model.includes('787') || airplane.model.includes('330')
      const rows = isLarge ? 50 : 30
      const firstRows = isLarge ? 2 : 0
      const businessRows = isLarge ? 10 : 2
      const premiumRows = isLarge ? 18 : 5
      const columns = ['A', 'B', 'C', 'D', 'E', 'F']

      const flightHash = flight.flightCall.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      const tierIndex = flightHash % 4

      for (let row = 1; row <= rows; row++) {
        let travelClass = economy
        let rangeKey = 'economy'

        if (row <= firstRows) { travelClass = first; rangeKey = 'first' }
        else if (row <= businessRows) { travelClass = business; rangeKey = 'business' }
        else if (row <= premiumRows) { travelClass = premium; rangeKey = 'premium' }

        for (const col of columns) {
          const seatId = `${row}${col}`

          await AircraftSeat.updateOrCreate(
            { aircraftId: airplane.aircraftId, seatId },
            { travelClassId: travelClass.travelClassId }
          )

          const [min, max] = PRICE_RANGES[rangeKey as keyof typeof PRICE_RANGES][tierIndex]

          let positionBonus = 0
          if (['A', 'F'].includes(col)) positionBonus = 50_000
          else if (['C', 'D'].includes(col)) positionBonus = 20_000

          const rowBonus = (rows - row) * 5_000
          const price = randomRounded(min + positionBonus + rowBonus, max + positionBonus + rowBonus)

          await FlightSeatPrice.updateOrCreate(
            { flightCall: flight.flightCall, aircraftId: airplane.aircraftId, seatId },
            { priceUsd: price }
          )
        }
      }

      if (flightCounter % 10 === 0) {
        console.log(`   Processed ${flightCounter}/${flights.length} flights...`)
      }
    }

    console.log('✅ 4-Class Seat prices seeded successfully!')
  }
}