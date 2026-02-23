import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class FlightSeatPrice extends BaseModel {
  @column({ isPrimary: true, columnName: 'flight_call' })
  declare flightCall: string

  @column({ isPrimary: true, columnName: 'aircraft_id' })
  declare aircraftId: number

  @column({ isPrimary: true, columnName: 'seat_id' })
  declare seatId: string

  @column({ columnName: 'price_usd' })
  declare priceUsd: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}