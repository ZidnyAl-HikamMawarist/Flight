import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('client_id').primary()
      table.string('first_name', 45).notNullable()
      table.string('middle_name', 45).nullable()
      table.string('last_name', 45).notNullable()
      table.string('phone', 45).notNullable()
      table.string('email', 45).notNullable().unique()
      table.string('passport', 45).nullable()
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