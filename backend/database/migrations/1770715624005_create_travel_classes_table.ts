import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'travel_classes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('travel_class_id').primary()
      table.string('name', 45).notNullable()
      table.text('description').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}