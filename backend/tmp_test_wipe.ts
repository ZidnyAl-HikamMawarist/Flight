import db from '@adonisjs/lucid/services/db'

async function testWipe() {
    try {
        console.log('Testing wipe order...')
        await db.from('reviews').del()
        console.log('- reviews cleared')
        await db.from('bookings').del()
        console.log('- bookings cleared')
        await db.from('flight_seat_prices').del()
        console.log('- flight_seat_prices cleared')
        await db.from('flight_aircraft_instances').del()
        console.log('- flight_aircraft_instances cleared')
        await db.from('flights').del()
        console.log('- flights cleared')
        await db.from('schedules').del()
        console.log('- schedules cleared')
        await db.from('airports').del()
        console.log('- airports cleared')
        await db.from('airlines').del()
        console.log('- airlines cleared')
        await db.from('aircraft_seats').del()
        console.log('- aircraft_seats cleared')
        await db.from('aircraft_instances').del()
        console.log('- aircraft_instances cleared')
        await db.from('aircraft').del()
        console.log('- aircraft cleared')
        await db.from('aircraft_manufacturers').del()
        console.log('- aircraft_manufacturers cleared')
        console.log('Success!')
    } catch (e) {
        console.error('Failed at some point:')
        console.error(e)
    } finally {
        process.exit()
    }
}

testWipe()
