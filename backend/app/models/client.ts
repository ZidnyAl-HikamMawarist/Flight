import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Client extends BaseModel {
  @column({ isPrimary: true, columnName: 'client_id' })
  declare clientId: number

  @column({ columnName: 'first_name' })
  declare firstName: string

  @column({ columnName: 'middle_name' })
  declare middleName: string | null

  @column({ columnName: 'last_name' })
  declare lastName: string

  @column()
  declare phone: string

  @column()
  declare email: string

  @column()
  declare passport: string | null

  @column({ columnName: 'iata_country_code' })
  declare iataCountryCode: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}