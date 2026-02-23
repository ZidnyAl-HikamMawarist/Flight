import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'aircrafts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('aircraft_id').primary()
      table.integer('aircraft_manufacturer_id').unsigned()
        .references('aircraft_manufacturer_id')
        .inTable('aircraft_manufacturers')
        .onDelete('CASCADE')
      table.string('model', 45).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}