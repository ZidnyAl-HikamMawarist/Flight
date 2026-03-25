import env from '#start/env'
import Airport from '#models/airport'
import Airline from '#models/airline'
import Country from '#models/country'
import Flight from '#models/flight'
import Schedule from '#models/schedule'
import Aircraft from '#models/aircraft'
import FlightStatus from '#models/flight_status'
import AircraftSeat from '#models/aircraft_seat'
import TravelClass from '#models/travel_class'
import FlightSeatPrice from '#models/flight_seat_price'
import { DateTime } from 'luxon'

export default class AirlabsService {
    private apiKey = env.get('AIRLABS_API_KEY')
    private baseUrl = 'https://airlabs.co/api/v9'

    /**
     * Sync Airports from AirLabs
     */
    public async syncAirports() {
        if (!this.apiKey) throw new Error('AIRLABS_API_KEY is not set')

        await this.syncCountries()

        const asean = ['ID', 'MY', 'SG', 'TH', 'PH', 'VN', 'KH', 'LA', 'MM', 'BN']
        const response = await fetch(`${this.baseUrl}/airports?api_key=${this.apiKey}`)
        const data = (await response.json()) as any

        // Filter valid IATA and ASEAN first, then slice
        const rawAirports = data.response || []
        const airports = rawAirports
            .filter((ap: any) => ap.iata_code && asean.includes(ap.country_code))
            .slice(0, 500)

        console.log(`Syncing ${airports.length} valid ASEAN airports...`)

        let savedCount = 0
        for (const ap of airports) {
            await Airport.updateOrCreate(
                { iataAirportCode: ap.iata_code },
                {
                    name: ap.name,
                    city: ap.city || ap.city_code || ap.town || ap.name || 'Unknown City',
                    iataCountryCode: ap.country_code
                }
            )
            savedCount++
        }
        return { count: savedCount }
    }

    /**
     * Sync Airlines from AirLabs
     */
    public async syncAirlines() {
        if (!this.apiKey) throw new Error('AIRLABS_API_KEY is not set')

        // Lowercase ASEAN check for better matching if needed, or just keep it simple
        const asean = ['ID', 'MY', 'SG', 'TH', 'PH', 'VN', 'KH', 'LA', 'MM', 'BN']
        
        // Fetch all airlines - AirLabs usually returns active ones by default
        const response = await fetch(`${this.baseUrl}/airlines?api_key=${this.apiKey}`)
        const data = (await response.json()) as any

        const allAirlines = data.response || []
        console.log(`Received ${allAirlines.length} total airlines from AirLabs.`)

        const airlines = allAirlines.filter((al: any) => {
            const country = (al.country_code || al.country_ia || '').toUpperCase()
            // If we filter too hard, we might get 0. Let's at least ensure it's a valid airline with IATA
            return al.iata_code && (asean.includes(country) || !country) 
        }).slice(0, 300)

        console.log(`Found ${airlines.length} potential airlines.`)

        for (const al of airlines) {
            const logoUrl = `https://airlabs.co/img/airlines/m/${al.iata_code}.png`
            await Airline.updateOrCreate(
                { iataCode: al.iata_code },
                {
                    name: al.name || al.icao_code || 'Airline ' + al.iata_code,
                    logoUrl: logoUrl,
                    countryCode: al.country_code || 'ID'
                }
            )
        }
        return { count: airlines.length }
    }

    /**
     * Sync Real-Life Schedules for specific ASEAN airports
     */
    public async syncRealSchedules() {
        if (!this.apiKey) throw new Error('AIRLABS_API_KEY is not set')

        // Ensure we have at least one aircraft to assign to these flights
        const aircraft = await this.ensureAtLeastOneAircraft()
        
        const targetAirports = ['CGK', 'SIN', 'KUL', 'DPS', 'SUB', 'BKK']
        let totalCreated = 0

        const statusScheduled = await FlightStatus.firstOrCreate({ name: 'Scheduled' }, { name: 'Scheduled' })

        const classes = await TravelClass.all()
        const classMap = classes.reduce((acc, c) => ({ ...acc, [c.name]: c.travelClassId }), {} as Record<string, number>)

        for (const iata of targetAirports) {
            try {
                const response = await fetch(`${this.baseUrl}/schedules?api_key=${this.apiKey}&dep_iata=${iata}`)
                const data = (await response.json()) as any
                const schedules = (data.response || []).slice(0, 15)

                for (const s of schedules) {
                    if (!s.flight_iata || !s.arr_iata || !s.dep_iata) continue

                    // CRITICAL: Ensure origin and destination airports exist to avoid Foreign Key errors
                    await this.ensureAirportExists(s.dep_iata)
                    await this.ensureAirportExists(s.arr_iata)

                    // 1. Create Schedule
                    const localSchedule = await Schedule.create({
                        originIataAirportCode: s.dep_iata,
                        destIataAirportCode: s.arr_iata,
                        departureTimeGmt: s.dep_time ? DateTime.fromISO(s.dep_time.replace(' ', 'T')) : DateTime.now(),
                        arrivalTimeGmt: s.arr_time ? DateTime.fromISO(s.arr_time.replace(' ', 'T')) : DateTime.now(),
                    })

                    // 2. Create Flight
                    const flight = await Flight.create({
                        flightCall: s.flight_iata,
                        scheduleId: localSchedule.scheduleId,
                        flightStatusId: statusScheduled.flightStatusId,
                        aircraftId: aircraft.aircraftId
                    })

                    // 3. Generate default seat prices
                    const seats = await AircraftSeat.query().where('aircraft_id', aircraft.aircraftId)
                    for (const seat of seats) {
                        let basePrice = 850000
                        if (seat.travelClassId === classMap['First Class']) basePrice = 15000000
                        else if (seat.travelClassId === classMap['Business']) basePrice = 5000000
                        else if (seat.travelClassId === classMap['Premium Economy']) basePrice = 2000000

                        await FlightSeatPrice.create({
                            flightCall: flight.flightCall,
                            aircraftId: aircraft.aircraftId,
                            seatId: seat.seatId,
                            priceUsd: basePrice + (Math.random() * 100000)
                        })
                    }
                    totalCreated++
                }
            } catch (err) {
                console.error(`Gagal sync jadwal untuk ${iata}:`, err.message)
            }
        }

        return { count: totalCreated }
    }

    /**
     * Helper to ensure an airport exists in our DB (prevents FK errors)
     */
    private async ensureAirportExists(iataCode: string) {
        const existing = await Airport.find(iataCode)
        if (existing) return existing

        // If not exists, fetch minimal info from AirLabs and create it
        const response = await fetch(`${this.baseUrl}/airports?api_key=${this.apiKey}&iata_code=${iataCode}`)
        const data = (await response.json()) as any
        const info = data.response?.[0]

        if (info) {
            await this.ensureCountryExists(info.country_code)
            return await Airport.create({
                iataAirportCode: iataCode,
                name: info.name || `Airport ${iataCode}`,
                city: info.city || info.city_code || info.town || info.name || 'Unknown City',
                iataCountryCode: info.country_code || 'ID'
            })
        }
        
        // Final fallback if API doesn't have it
        await this.ensureCountryExists('ID')
        return await Airport.create({
            iataAirportCode: iataCode,
            name: `Unknown Airport ${iataCode}`,
            city: 'Unknown',
            iataCountryCode: 'ID'
        })
    }

    private async ensureCountryExists(code: string) {
        if (!code) return
        const existing = await Country.find(code)
        if (existing) return existing

        return await Country.create({
            iataCountryCode: code,
            name: `Country ${code}`
        })
    }

    /**
     * Ensures at least one aircraft exists to avoid sync errors after a wipe
     */
    private async ensureAtLeastOneAircraft() {
        const existing = await Aircraft.first()
        if (existing) return existing

        console.log('No aircraft found. Creating a default Boeing 737-800...')
        
        const AircraftManufacturer = (await import('#models/aircraft_manufacturer')).default
        const manufacturer = await AircraftManufacturer.firstOrCreate({ name: 'Boeing' }, { name: 'Boeing' })

        const aircraft = await Aircraft.create({
            model: '737-800',
            aircraftManufacturerId: manufacturer.aircraftManufacturerId
        })

        // Add 30 default seats (6 per row, 5 rows)
        for (let row = 1; row <= 5; row++) {
            for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
                const seatId = `${row}${col}`
                let travelClassId = 1 // Economy fallback
                
                // Try to find correct class ID if possible
                const tc = await TravelClass.findBy('name', row === 1 ? 'First Class' : (row === 2 ? 'Business' : 'Economy'))
                if (tc) travelClassId = tc.travelClassId

                await AircraftSeat.create({
                    aircraftId: aircraft.aircraftId,
                    seatId,
                    travelClassId
                })
            }
        }

        return aircraft
    }

    /**
     * Sync Countries from AirLabs
     */
    public async syncCountries() {
        if (!this.apiKey) throw new Error('AIRLABS_API_KEY is not set')

        const response = await fetch(`${this.baseUrl}/countries?api_key=${this.apiKey}`)
        const data = (await response.json()) as any

        if (!data.response) {
            throw new Error(data.error?.message || 'Failed to fetch countries from AirLabs')
        }

        const countries = data.response
        console.log(`Syncing ${countries.length} countries...`)

        for (const c of countries) {
            if (!c.code) continue

            await Country.updateOrCreate(
                { iataCountryCode: c.code },
                { name: c.name }
            )
        }

        return { count: countries.length }
    }
}
