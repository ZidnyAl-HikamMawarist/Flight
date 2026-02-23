import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'flight_statuses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('flight_status_id').primary()
      table.string('name', 45).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}