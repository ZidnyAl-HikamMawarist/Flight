import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Booking from '#models/booking'

export default class Review extends BaseModel {
    static table = 'reviews'

    @column({ isPrimary: true, columnName: 'review_id' })
    declare reviewId: number

    @column({ columnName: 'booking_id' })
    declare bookingId: number

    @column({ columnName: 'user_id' })
    declare userId: number

    @column({ columnName: 'flight_call' })
    declare flightCall: string

    @column()
    declare rating: number // 1-5

    @column()
    declare comment: string | null

    @belongsTo(() => User, { foreignKey: 'userId' })
    declare user: BelongsTo<typeof User>

    @belongsTo(() => Booking, { foreignKey: 'bookingId' })
    declare booking: BelongsTo<typeof Booking>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
}
