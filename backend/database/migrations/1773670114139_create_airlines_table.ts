import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'airlines'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('iata_code', 3).primary()
      table.string('name').notNullable()
      table.string('logo_url').nullable()
      table.string('country_code', 3).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}