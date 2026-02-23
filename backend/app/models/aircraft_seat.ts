import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AircraftSeat extends BaseModel {
  @column({ isPrimary: true, columnName: 'aircraft_id' })
  declare aircraftId: number

  @column({ isPrimary: true, columnName: 'seat_id' })
  declare seatId: string

  @column({ columnName: 'travel_class_id' })
  declare travelClassId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}