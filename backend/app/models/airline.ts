import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Airline extends BaseModel {
  @column({ isPrimary: true, columnName: 'iata_code' })
  declare iataCode: string

  @column()
  declare name: string

  @column({ columnName: 'logo_url' })
  declare logoUrl: string

  @column({ columnName: 'country_code' })
  declare countryCode: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}