import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('booking_id').primary()
      table.integer('client_id').unsigned()
        .references('client_id')
        .inTable('clients')
      table.string('flight_call')
        .references('flight_call')
        .inTable('flights')
      table.integer('aircraft_id').unsigned()
      table.string('seat_id', 10)

      table.foreign(['aircraft_id', 'seat_id'])
        .references(['aircraft_id', 'seat_id'])
        .inTable('aircraft_seats')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}