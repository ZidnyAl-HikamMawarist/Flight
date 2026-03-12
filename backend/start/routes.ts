/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import app from '@adonisjs/core/services/app'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Serve static files from public directory
router.get('/uploads/*', ({ request, response }) => {
  const filePath = request.url().replace('/uploads', '')
  return response.download(app.makePath('public/uploads', filePath))
})


const AuthController = () => import('#controllers/auth_controller')
const FlightsController = () => import('#controllers/flights_controller')
const BookingsController = () => import('#controllers/bookings_controller')
const AdminController = () => import('#controllers/admin_controller')
const ReviewsController = () => import('#controllers/reviews_controller')
const SocialAuthController = () => import('#controllers/social_auth_controller')
const TicketController = () => import('#controllers/ticket_controller')

router.group(() => {
  router.get(':provider/redirect', [SocialAuthController, 'redirect'])
  router.get(':provider/callback', [SocialAuthController, 'callback'])
}).prefix('api/auth/social')

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

  // Ticket endpoints
  router.get('bookings/:id/qr', [TicketController, 'generateQR'])
  router.get('bookings/:id/pdf', [TicketController, 'downloadPDF'])
  router.post('bookings/:id/send-email', [TicketController, 'sendEmail'])
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
  router.post('upload-avatar', [AuthController, 'uploadAvatar']).use(async ({ auth, response }, next) => {
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
