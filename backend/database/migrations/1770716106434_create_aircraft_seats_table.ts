import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'aircraft_seats'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('aircraft_id').unsigned()
        .references('aircraft_id')
        .inTable('aircrafts')
        .onDelete('CASCADE')
      table.string('seat_id', 10).notNullable()
      table.integer('travel_class_id').unsigned()
        .references('travel_class_id')
        .inTable('travel_classes')

      table.primary(['aircraft_id', 'seat_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}