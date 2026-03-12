import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'flights'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('flight_call').primary().notNullable()
      table.integer('schedule_id').unsigned()
        .references('schedule_id')
        .inTable('schedules')
        .onDelete('CASCADE')
      table.integer('flight_status_id').unsigned()
        .references('flight_status_id')
        .inTable('flight_statuses')
      table.integer('aircraft_id').unsigned()
        .references('aircraft_id')
        .inTable('aircrafts')
        .onDelete('SET NULL')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}