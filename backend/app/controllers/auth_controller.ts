import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
    /**
     * Menangani pendaftaran user baru
     */
    async register({ request, response }: HttpContext) {
        const payload = await request.validateUsing(registerValidator)
        const user = await User.create(payload)

        return response.created({
            message: 'User berhasil didaftarkan',
            user: user
        })
    }

    /**
     * Menangani login dan generate token
     */
    async login({ request, response }: HttpContext) {
        const { email, password } = await request.validateUsing(loginValidator)

        // Cek kredensial
        const user = await User.verifyCredentials(email, password)

        // Generate token (menggunakan Opaque Access Token)
        const token = await User.accessTokens.create(user)

        return response.ok({
            message: 'Login berhasil',
            token: token,
            user: user
        })
    }

    /**
     * Logout (hapus token saat ini)
     */
    async logout({ auth, response }: HttpContext) {
        const user = auth.user!
        await User.accessTokens.delete(user, user.currentAccessToken.identifier)
        return response.ok({ message: 'Logged out successfully' })
    }

    /**
   * Mengambil data user yang sedang login
   */
    async me({ auth, response }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            return response.ok(user)
        } catch {
            return response.unauthorized({ message: 'Belum login' })
        }
    }

    /**
     * Update profil user
     */
    async updateProfile({ auth, request, response }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            const { fullName, phone, password, avatarUrl } = request.all()

            if (fullName) user.fullName = fullName
            if (phone !== undefined) user.phone = phone
            if (avatarUrl !== undefined) user.avatarUrl = avatarUrl
            if (password && password.trim() !== '') {
                // AdonisJS hashes automatically via beforeSave hook on AuthFinder mixin
                user.password = password
            }

            await user.save()
            return response.ok({ message: 'Profil berhasil diperbarui', user })
        } catch {
            return response.unauthorized({ message: 'Belum login' })
        }
    }
}