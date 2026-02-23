/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})


const AuthController = () => import('#controllers/auth_controller')
const FlightsController = () => import('#controllers/flights_controller')
const BookingsController = () => import('#controllers/bookings_controller')
const AdminController = () => import('#controllers/admin_controller')
const ReviewsController = () => import('#controllers/reviews_controller')

router.group(() => {
  router.get('flights', [FlightsController, 'index'])
  router.get('airports', [FlightsController, 'airports'])
  router.get('flights/:flightCall/seats', [BookingsController, 'seats'])
  router.post('bookings', [BookingsController, 'store'])
  router.get('bookings/history', [BookingsController, 'history'])
  router.get('bookings/:id', [BookingsController, 'show'])
  router.delete('bookings/:id', [BookingsController, 'destroy'])
  router.post('bookings/:id/pay', [BookingsController, 'pay']) // Payment simulation
  // Reviews (public read)
  router.get('flights/:flightCall/reviews', [ReviewsController, 'index'])
}).prefix('api')

// Review routes (require auth)
router.group(() => {
  router.post('reviews', [ReviewsController, 'store'])
  router.delete('reviews/:id', [ReviewsController, 'destroy'])
}).prefix('api').use(async ({ auth, response }, next) => {
  try {
    await auth.authenticate()
    return next()
  } catch {
    return response.unauthorized({ message: 'Harus login dulu' })
  }
})

router.group(() => {
  router.post('register', [AuthController, 'register'])
  router.post('login', [AuthController, 'login'])
  router.post('logout', [AuthController, 'logout']).use(async ({ auth, response }, next) => {
    try {
      await auth.authenticate()
      return next()
    } catch {
      return response.unauthorized({ message: 'Harus login dulu' })
    }
  })
  router.get('me', [AuthController, 'me']).use(async ({ auth, response }, next) => {
    try {
      await auth.authenticate()
      return next()
    } catch {
      return response.unauthorized({ message: 'Harus login dulu' })
    }
  })
  router.put('profile', [AuthController, 'updateProfile']).use(async ({ auth, response }, next) => {
    try {
      await auth.authenticate()
      return next()
    } catch {
      return response.unauthorized({ message: 'Harus login dulu' })
    }
  })
}).prefix('api/auth')

// Admin Routes
router.group(() => {
  router.get('stats', [AdminController, 'stats'])
  router.get('airports', [AdminController, 'airportIndex'])
  router.post('airports', [AdminController, 'airportStore'])
  router.put('airports/:code', [AdminController, 'airportUpdate'])
  router.delete('airports/:code', [AdminController, 'airportDelete'])
  router.get('flights', [AdminController, 'flightIndex'])
  router.post('flights', [AdminController, 'flightStore'])
  router.put('flights/:flightCall', [AdminController, 'flightUpdate'])
  router.delete('flights/:flightCall', [AdminController, 'flightDelete'])
  router.get('bookings', [AdminController, 'bookingIndex'])
  router.get('statuses', [AdminController, 'statuses'])
  router.get('aircrafts', [AdminController, 'aircrafts'])
}).prefix('api/admin')

// Aircraft Routes
router.group(() => {
  router.get(':aircraftId/seats', [AdminController, 'aircraftSeats'])
}).prefix('api/aircraft')
