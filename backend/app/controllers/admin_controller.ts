import type { HttpContext } from '@adonisjs/core/http'
import Airport from '#models/airport'
import Aircraft from '#models/aircraft'
import Schedule from '#models/schedule'
import Flight from '#models/flight'
import AircraftSeat from '#models/aircraft_seat'
import FlightSeatPrice from '#models/flight_seat_price'
import TravelClass from '#models/travel_class'
import FlightStatus from '#models/flight_status'
import Booking from '#models/booking'

export default class AdminController {
    /**
     * Dashboard stats
     */
    async stats({ response }: HttpContext) {
        const totalFlights = await Flight.query().count('* as total')
        const totalBookings = await Booking.query().count('* as total')
        const totalAirports = await Airport.query().count('* as total')
        const totalAircrafts = await Aircraft.query().count('* as total')

        return response.ok({
            flights: totalFlights[0].$extras.total,
            bookings: totalBookings[0].$extras.total,
            airports: totalAirports[0].$extras.total,
            aircrafts: totalAircrafts[0].$extras.total,
        })
    }

    /**
     * CRUD Airports
     */
    async airportIndex({ response }: HttpContext) {
        const airports = await Airport.all()
        return response.ok(airports)
    }

    async airportStore({ request, response }: HttpContext) {
        const data = request.only(['iataAirportCode', 'name', 'city', 'iataCountryCode'])
        const airport = await Airport.create(data)
        return response.created(airport)
    }

    async airportUpdate({ params, request, response }: HttpContext) {
        const airport = await Airport.findOrFail(params.code)
        const data = request.only(['name', 'city', 'iataCountryCode'])
        airport.merge(data)
        await airport.save()
        return response.ok(airport)
    }

    async airportDelete({ params, response }: HttpContext) {
        const airport = await Airport.findOrFail(params.code)
        await airport.delete()
        return response.ok({ message: 'Bandara dihapus' })
    }

    /**
     * CRUD Schedules & Flights
     */
    async flightIndex({ response }: HttpContext) {
        const flights = await Flight.query()
            .preload('schedule', (s) => {
                s.preload('originAirport')
                s.preload('destinationAirport')
            })
            .preload('status')
        return response.ok(flights)
    }

    async flightStore({ request, response }: HttpContext) {
        // Accept optional aircraftId to auto-generate seat prices
        const { flightCall, origin, destination, departureTime, arrivalTime, statusId, aircraftId } = request.all()

        const schedule = await Schedule.create({
            originIataAirportCode: origin,
            destIataAirportCode: destination,
            departureTimeGmt: departureTime,
            arrivalTimeGmt: arrivalTime,
        })

        const flight = await Flight.create({
            flightCall,
            scheduleId: schedule.scheduleId,
            flightStatusId: statusId,
        })

        if (aircraftId) {
            // fetch seats for aircraft and create flight seat price entries
            const seats = await AircraftSeat.query().where('aircraft_id', aircraftId)
            // load travel class price mapping (fallbacks)
            const business = await TravelClass.findBy('name', 'Business')

            for (const s of seats) {
                // set default prices based on travel class
                const price = s.travelClassId === business?.travelClassId ? 150 : 50

                await FlightSeatPrice.updateOrCreate(
                    {
                        flightCall: flight.flightCall,
                        aircraftId: aircraftId,
                        seatId: s.seatId
                    },
                    {
                        priceUsd: price
                    }
                )
            }
        }

        return response.created(flight)
    }

    async flightUpdate({ params, request, response }: HttpContext) {
        const flightCall = params.flightCall
        const { origin, destination, departureTime, arrivalTime, statusId, aircraftId } = request.all()

        const flight = await Flight.findOrFail(flightCall)

        // update schedule
        const schedule = await Schedule.findOrFail(flight.scheduleId)
        if (origin) schedule.originIataAirportCode = origin
        if (destination) schedule.destIataAirportCode = destination
        if (departureTime) schedule.departureTimeGmt = departureTime
        if (arrivalTime) schedule.arrivalTimeGmt = arrivalTime
        await schedule.save()

        // update flight status
        if (statusId) {
            flight.flightStatusId = statusId
            await flight.save()
        }

        // optionally regenerate seat prices if aircraftId provided
        if (aircraftId) {
            const seats = await AircraftSeat.query().where('aircraft_id', aircraftId)
            const business = await TravelClass.findBy('name', 'Business')

            for (const s of seats) {
                const price = s.travelClassId === business?.travelClassId ? 150 : 50
                await FlightSeatPrice.updateOrCreate(
                    {
                        flightCall: flight.flightCall,
                        aircraftId: aircraftId,
                        seatId: s.seatId
                    },
                    {
                        priceUsd: price
                    }
                )
            }
        }

        // reload with relations for response
        await flight.load('status')
        await flight.load('schedule', (s) => {
            s.preload('originAirport')
            s.preload('destinationAirport')
        })

        return response.ok(flight)
    }

    async flightDelete({ params, response }: HttpContext) {
        const flight = await Flight.findOrFail(params.flightCall)
        await flight.delete()
        return response.ok({ message: 'Penerbangan dihapus' })
    }

    /**
     * Monitoring Bookings
     */
    async bookingIndex({ response }: HttpContext) {
        const bookings = await Booking.query()
            .preload('flight', (f) => {
                f.preload('schedule', (s) => {
                    s.preload('originAirport')
                    s.preload('destinationAirport')
                })
                f.preload('status')
            })
            .preload('client')
            .orderBy('created_at', 'desc')

        return response.ok(bookings)
    }

    /**
     * Get flight statuses for dropdown
     */
    async statuses({ response }: HttpContext) {
        const statuses = await FlightStatus.all()
        return response.ok(statuses)
    }

    /**
     * Get aircraft for dropdown
     */
    async aircrafts({ response }: HttpContext) {
        const aircrafts = await Aircraft.all()
        return response.ok(aircrafts)
    }

    /**
     * Get seats for specific aircraft
     */
    async aircraftSeats({ params, response }: HttpContext) {
        const aircraftId = params.aircraftId
        const seats = await AircraftSeat.query().where('aircraft_id', aircraftId)
        
        // Mock availability and price for demo
        const seatsWithAvailability = seats.map(seat => ({
            ...seat.toJSON(),
            isAvailable: Math.random() > 0.3, // 70% available for demo
            price: seat.travelClassId === 2 ? 150 : 50 // Assuming business class ID is 2
        }))
        
        return response.ok(seatsWithAvailability)
    }
}
