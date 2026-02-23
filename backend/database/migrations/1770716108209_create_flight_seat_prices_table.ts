import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'flight_seat_prices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('flight_call')
        .references('flight_call')
        .inTable('flights')
        .onDelete('CASCADE')
      table.integer('aircraft_id').unsigned()
      table.string('seat_id', 10)
      table.double('price_usd').notNullable()

      table.foreign(['aircraft_id', 'seat_id'])
        .references(['aircraft_id', 'seat_id'])
        .inTable('aircraft_seats')

      table.primary(['flight_call', 'aircraft_id', 'seat_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}