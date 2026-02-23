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
    [450_000, 700_000],   // tier 1 – short haul
    [700_000, 1_100_000], // tier 2 – medium haul
    [1_100_000, 1_800_000], // tier 3 – long haul
    [1_500_000, 2_200_000], // tier 4 – very long / peak
  ],
  business: [
    [1_200_000, 2_000_000],
    [2_000_000, 3_500_000],
    [3_500_000, 5_500_000],
    [5_500_000, 7_500_000],
  ],
}

/** Pilih angka bulat acak dalam [min, max] yang dibulatkan ke ribuan terdekat */
function randomRounded(min: number, max: number): number {
  const raw = Math.floor(Math.random() * (max - min + 1)) + min
  return Math.round(raw / 1000) * 1000 // bulatkan ke ribuan
}

export default class extends BaseSeeder {
  async run() {
    const airplane = await Aircraft.findByOrFail('model', '737-800')
    const economy = await TravelClass.findByOrFail('name', 'Economy')
    const business = await TravelClass.findByOrFail('name', 'Business')
    const flights = await Flight.all()

    const rows = 30
    const businessRows = 5
    const columns = ['A', 'B', 'C', 'D', 'E', 'F']

    console.log(`Seeding seat prices (IDR) for ${airplane.model}...`)

    for (let row = 1; row <= rows; row++) {
      const isBusiness = row <= businessRows
      const travelClassId = isBusiness ? business.travelClassId : economy.travelClassId

      for (const col of columns) {
        const seatId = `${row}${col}`

        await AircraftSeat.updateOrCreate(
          { aircraftId: airplane.aircraftId, seatId },
          { travelClassId }
        )

        for (const flight of flights) {
          // Tentukan tier harga berdasarkan flightCall hash → beragam antar-flight
          const flightHash = flight.flightCall
            .split('')
            .reduce((acc, c) => acc + c.charCodeAt(0), 0)

          const tierIndex = flightHash % 4 // 0–3

          const [min, max] = isBusiness
            ? PRICE_RANGES.business[tierIndex]
            : PRICE_RANGES.economy[tierIndex]

          // Tambahan variasi kecil per baris kursi (kursi depan sedikit lebih mahal)
          const rowBonus = isBusiness ? row * 25_000 : row * 5_000

          const price = randomRounded(min + rowBonus, max + rowBonus)

          await FlightSeatPrice.updateOrCreate(
            { flightCall: flight.flightCall, aircraftId: airplane.aircraftId, seatId },
            { priceUsd: price } // field tetap priceUsd tapi value sekarang IDR
          )
        }
      }
    }

    console.log('✅ Seat prices seeded successfully!')
    console.log(`   Economy  : Rp ${(450_000).toLocaleString('id-ID')} – Rp ${(2_200_000).toLocaleString('id-ID')}`)
    console.log(`   Business : Rp ${(1_200_000).toLocaleString('id-ID')} – Rp ${(7_500_000).toLocaleString('id-ID')}`)
  }
}