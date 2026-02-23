import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'reviews'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('review_id')
            table.integer('booking_id').unsigned().references('booking_id').inTable('bookings').onDelete('CASCADE')
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
            table.string('flight_call').notNullable()
            table.integer('rating').unsigned().notNullable() // 1-5
            table.text('comment').nullable()
            table.timestamps(true, true)
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
