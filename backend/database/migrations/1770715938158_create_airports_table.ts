import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'airports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('iata_airport_code', 3).primary().notNullable()
      table.string('name', 45).notNullable()
      table.string('city', 45).notNullable()
      table.string('iata_country_code', 2)
        .references('iata_country_code')
        .inTable('countries')
        .onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}