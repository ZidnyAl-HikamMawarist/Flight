import { schema, rules } from '@adonisjs/validator'

export const airportStoreSchema = schema.create({
  iataAirportCode: schema.string([
    rules.minLength(3),
    rules.maxLength(3),
    rules.regex(/^[A-Z]{3}$/)
  ]),
  name: schema.string.nullable(),
  city: schema.string.nullable(),
  iataCountryCode: schema.string([
    rules.minLength(2),
    rules.maxLength(2),
    rules.regex(/^[A-Z]{2}$/)
  ])
})

export const flightStoreSchema = schema.create({
  flightCall: schema.string([
    rules.minLength(3),
    rules.maxLength(20)
  ]),
  origin: schema.string([
    rules.minLength(3),
    rules.maxLength(3),
    rules.regex(/^[A-Z]{3}$/)
  ]),
  destination: schema.string([
    rules.minLength(3),
    rules.maxLength(3),
    rules.regex(/^[A-Z]{3}$/)
  ]),
  departureTimeGmt: schema.date(),
  arrivalTimeGmt: schema.date(),
  statusId: schema.number([
    rules.range(1, 999)
  ]),
  aircraftId: schema.number.optional([
    rules.range(1, 999)
  ]),
  economyPrice: schema.number.optional([rules.range(0)]),
  premiumPrice: schema.number.optional([rules.range(0)]),
  businessPrice: schema.number.optional([rules.range(0)]),
  firstPrice: schema.number.optional([rules.range(0)])
})

export const airportUpdateSchema = schema.create({
  name: schema.string.optional().nullable(),
  city: schema.string.optional().nullable(),
  iataCountryCode: schema.string.optional([
    rules.minLength(2),
    rules.maxLength(2),
    rules.regex(/^[A-Z]{2}$/)
  ])
})

