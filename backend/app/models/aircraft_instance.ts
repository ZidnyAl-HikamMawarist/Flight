import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AircraftInstance extends BaseModel {
  @column({ isPrimary: true, columnName: 'aircraft_instance_id' })
  declare aircraftInstanceId: number

  @column({ columnName: 'aircraft_id' })
  declare aircraftId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}