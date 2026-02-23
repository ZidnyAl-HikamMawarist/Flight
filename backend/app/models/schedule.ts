import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Airport from '#models/airport'

export default class Schedule extends BaseModel {
  @column({ isPrimary: true, columnName: 'schedule_id' })
  declare scheduleId: number

  @column({ columnName: 'origin_iata_airport_code' })
  declare originIataAirportCode: string

  @column({ columnName: 'dest_iata_airport_code' })
  declare destIataAirportCode: string

  @belongsTo(() => Airport, { foreignKey: 'originIataAirportCode' })
  declare originAirport: BelongsTo<typeof Airport>

  @belongsTo(() => Airport, { foreignKey: 'destIataAirportCode' })
  declare destinationAirport: BelongsTo<typeof Airport>

  @column.dateTime({ columnName: 'departure_time_gmt' })
  declare departureTimeGmt: DateTime

  @column.dateTime({ columnName: 'arrival_time_gmt' })
  declare arrivalTimeGmt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}