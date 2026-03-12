import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Flight from '#models/flight'
import Client from '#models/client'

export default class Booking extends BaseModel {
  @column({ isPrimary: true, columnName: 'booking_id' })
  declare bookingId: number

  @column({ columnName: 'client_id' })
  declare clientId: number

  @column({ columnName: 'flight_call' })
  declare flightCall: string

  @column({ columnName: 'aircraft_id' })
  declare aircraftId: number

  @column({ columnName: 'seat_id' })
  declare seatId: string

  @column({ columnName: 'payment_status' })
  declare paymentStatus: string // 'pending' | 'paid' | 'cancelled'

  @column({ columnName: 'payment_method' })
  declare paymentMethod: string | null // 'bank_transfer' | 'credit_card' | 'e_wallet'

  @column.dateTime({ columnName: 'paid_at' })
  declare paidAt: DateTime | null

  @column({ columnName: 'booking_code' })
  declare bookingCode: string | null

  @column({ columnName: 'ticket_number' })
  declare ticketNumber: string | null

  @column({ columnName: 'sequence_number' })
  declare sequenceNumber: number | null

  @belongsTo(() => Flight, { foreignKey: 'flightCall' })
  declare flight: BelongsTo<typeof Flight>

  @belongsTo(() => Client, { foreignKey: 'clientId' })
  declare client: BelongsTo<typeof Client>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}