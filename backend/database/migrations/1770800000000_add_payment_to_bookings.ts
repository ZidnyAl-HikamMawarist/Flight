import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'bookings'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('payment_status').defaultTo('pending') // pending | paid | cancelled
            table.string('payment_method').nullable()           // bank_transfer | credit_card | e_wallet
            table.timestamp('paid_at').nullable()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('payment_status')
            table.dropColumn('payment_method')
            table.dropColumn('paid_at')
        })
    }
}
