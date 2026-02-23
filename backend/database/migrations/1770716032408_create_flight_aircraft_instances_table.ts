import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'flight_aircraft_instances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('flight_call')
        .references('flight_call')
        .inTable('flights')
        .onDelete('CASCADE')
      table.integer('aircraft_instance_id').unsigned()
        .references('aircraft_instance_id')
        .inTable('aircraft_instances')
        .onDelete('CASCADE')

      table.primary(['flight_call', 'aircraft_instance_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}