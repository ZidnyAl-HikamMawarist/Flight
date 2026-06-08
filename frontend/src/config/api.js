// API Configuration
// Menggunakan hostname dinamis agar bisa berjalan di berbagai environment
export const API_BASE_URL = `http://${window.location.hostname}:3333`;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  PROFILE: '/api/auth/profile',
  UPLOAD_AVATAR: '/api/auth/upload-avatar',
  SOCIAL_GOOGLE: '/api/auth/social/google/redirect',
  
  // Flights
  FLIGHTS: '/api/flights',
  FLIGHT_SEATS: (flightCall) => `/api/flights/${flightCall}/seats`,
  FLIGHT_REVIEWS: (flightCall) => `/api/flights/${flightCall}/reviews`,
  
  // Airports
  AIRPORTS: '/api/airports',
  
  // Bookings
  BOOKINGS: '/api/bookings',
  BOOKING_HISTORY: '/api/bookings/history',
  BOOKING_DETAIL: (bookingId) => `/api/bookings/${bookingId}`,
  BOOKING_PAY: (bookingId) => `/api/bookings/${bookingId}/pay`,
  BOOKING_PDF: (bookingId) => `/api/bookings/${bookingId}/pdf`,
  BOOKING_SEND_EMAIL: (bookingId) => `/api/bookings/${bookingId}/send-email`,
  
  // Reviews
  REVIEWS: '/api/reviews',
  
  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_DELETE: (userId) => `/api/admin/users/${userId}`,
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_AIRPORTS: '/api/admin/airports',
  ADMIN_AIRPORT_DELETE: (code) => `/api/admin/airports/${code}`,
  ADMIN_FLIGHTS: '/api/admin/flights',
  ADMIN_FLIGHT_DELETE: (flightCall) => `/api/admin/flights/${flightCall}`,
  ADMIN_FLIGHT_UPDATE: (flightCall) => `/api/admin/flights/${flightCall}`,
  ADMIN_BOOKINGS: '/api/admin/bookings',
  ADMIN_STATUSES: '/api/admin/statuses',
  ADMIN_AIRCRAFTS: '/api/admin/aircrafts',
  AIRCRAFT_SEATS: (aircraftId) => `/api/aircraft/${aircraftId}/seats`,
};

// Helper function untuk membuat full URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
