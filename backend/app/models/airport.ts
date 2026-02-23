import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Airport extends BaseModel {
  @column({ isPrimary: true, columnName: 'iata_airport_code' })
  declare iataAirportCode: string

  @column()
  declare name: string

  @column()
  declare city: string

  @column({ columnName: 'iata_country_code' })
  declare iataCountryCode: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}