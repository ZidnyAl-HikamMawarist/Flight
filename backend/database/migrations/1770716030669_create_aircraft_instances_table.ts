import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'aircraft_instances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('aircraft_instance_id').primary()
      table.integer('aircraft_id').unsigned()
        .references('aircraft_id')
        .inTable('aircrafts')
        .onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}