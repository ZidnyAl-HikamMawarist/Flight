import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'bookings'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('booking_code', 6).nullable().unique() // PNR (e.g. XJ72KB)
            table.string('ticket_number', 13).nullable().unique() // E-Ticket No (e.g. 1262345678901)
            table.integer('sequence_number').nullable() // SEQ (Check-in order)
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('booking_code')
            table.dropColumn('ticket_number')
            table.dropColumn('sequence_number')
        })
    }
}
