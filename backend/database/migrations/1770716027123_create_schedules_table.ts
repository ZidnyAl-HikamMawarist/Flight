import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schedules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('schedule_id').primary()
      table.string('origin_iata_airport_code', 3)
        .references('iata_airport_code')
        .inTable('airports')
      table.string('dest_iata_airport_code', 3)
        .references('iata_airport_code')
        .inTable('airports')
      table.timestamp('departure_time_gmt').notNullable()
      table.timestamp('arrival_time_gmt').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}