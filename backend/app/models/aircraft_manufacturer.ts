import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AircraftManufacturer extends BaseModel {
  @column({ isPrimary: true, columnName: 'aircraft_manufacturer_id' })
  declare aircraftManufacturerId: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}