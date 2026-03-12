import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Schedule from '#models/schedule'
import FlightStatus from '#models/flight_status'
import FlightSeatPrice from '#models/flight_seat_price'

export default class Flight extends BaseModel {
  @column({ isPrimary: true, columnName: 'flight_call' })
  declare flightCall: string

  @column({ columnName: 'schedule_id' })
  declare scheduleId: number

  @column({ columnName: 'flight_status_id' })
  declare flightStatusId: number

  @column({ columnName: 'aircraft_id' })
  declare aircraftId: number

  @belongsTo(() => Schedule, { foreignKey: 'scheduleId' })
  declare schedule: BelongsTo<typeof Schedule>

  @belongsTo(() => FlightStatus, { foreignKey: 'flightStatusId' })
  declare status: BelongsTo<typeof FlightStatus>

  @hasMany(() => FlightSeatPrice, { foreignKey: 'flightCall' })
  declare seatPrices: HasMany<typeof FlightSeatPrice>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}