import type { HttpContext } from '@adonisjs/core/http'
import Review from '#models/review'

export default class ReviewsController {
    /**
     * Ambil semua review untuk penerbangan tertentu
     */
    async index({ params, response }: HttpContext) {
        const { flightCall } = params
        const reviews = await Review.query()
            .where('flight_call', flightCall)
            .preload('user', (q) => q.select('id', 'full_name'))
            .orderBy('created_at', 'desc')
            .limit(50)

        const avg = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0

        return response.ok({ reviews, averageRating: Math.round(avg * 10) / 10, total: reviews.length })
    }

    /**
     * Kirim review baru
     */
    async store({ auth, request, response }: HttpContext) {
        const user = auth.getUserOrFail()
        const { bookingId, flightCall, rating, comment } = request.all()

        if (!rating || rating < 1 || rating > 5) {
            return response.badRequest({ message: 'Rating harus antara 1–5' })
        }

        // Note: We allow review even without strict client matching for MVP

        // Cek apakah sudah review sebelumnya
        const existing = await Review.query()
            .where('flight_call', flightCall)
            .where('user_id', user.id)
            .first()

        if (existing) {
            return response.badRequest({ message: 'Anda sudah memberikan ulasan untuk penerbangan ini' })
        }

        const review = await Review.create({
            userId: user.id,
            bookingId: bookingId || null,
            flightCall,
            rating: parseInt(rating),
            comment: comment || null,
        })

        return response.created({ message: 'Ulasan berhasil dikirim!', review })
    }

    /**
     * Hapus review milik sendiri
     */
    async destroy({ auth, params, response }: HttpContext) {
        const user = auth.getUserOrFail()
        const review = await Review.query()
            .where('review_id', params.id)
            .where('user_id', user.id)
            .first()

        if (!review) {
            return response.notFound({ message: 'Ulasan tidak ditemukan' })
        }

        await review.delete()
        return response.ok({ message: 'Ulasan dihapus' })
    }
}
