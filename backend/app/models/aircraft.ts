import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Aircraft extends BaseModel {
  public static table = 'aircrafts'

  @column({ isPrimary: true, columnName: 'aircraft_id' })
  declare aircraftId: number

  @column({ columnName: 'aircraft_manufacturer_id' })
  declare aircraftManufacturerId: number

  @column()
  declare model: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}