import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SocialAuthController {
    /**
     * Mendefinisikan provider yang didukung
     */
    private supportedProviders = ['google']

    /**
     * Redirect ke provider sosial
     */
    async redirect({ ally, params, response }: HttpContext) {
        const provider = params.provider as 'google'

        if (!this.supportedProviders.includes(provider)) {
            return response.badRequest('Provider not supported')
        }

        return ally.use(provider).redirect()
    }

    /**
     * Menangani callback dari provider
     */
    async callback({ ally, params, request, response }: HttpContext) {
        const provider = params.provider as 'google' // cast to supported provider to fix lint

        if (!this.supportedProviders.includes(provider)) {
            return response.badRequest('Provider not supported')
        }

        const socialUser = ally.use(provider)

        // Handle user cancellation or errors
        if (socialUser.accessDenied()) {
            return response.redirect().toPath('/login?error=access_denied')
        }
        if (socialUser.stateMisMatch()) {
            return response.redirect().toPath('/login?error=state_mismatch')
        }
        if (socialUser.hasError()) {
            return response.redirect().toPath('/login?error=unknown')
        }

        const userData = await socialUser.user()

        // Cari user berdasarkan email
        let user = await User.findBy('email', userData.email)

        if (!user) {
            // Jika tidak ada, buat user baru (Implicit Registration)
            user = await User.create({
                fullName: userData.name,
                email: userData.email,
                role: 'user', // Default role
                // Password kosong karena login via SSO
                password: Math.random().toString(36).slice(-16),
                googleId: provider === 'google' ? userData.id : null,
                // appleId: provider === 'apple' ? userData.id : null,
                avatarUrl: userData.avatarUrl
            })
        } else {
            // Jika ada, update ID sosialnya jika belum ada
            if (provider === 'google' && !user.googleId) {
                user.googleId = userData.id
                await user.save()
            }
            /* else if (provider === 'apple' && !user.appleId) {
                user.appleId = userData.id
                await user.save()
            } */
        }

        // Login user dan generate token
        const token = await User.accessTokens.create(user)

        // Redirect kembali ke frontend dengan token
        // Catatan: Di produksi, gunakan cara yang lebih aman untuk mengirim token (misal via cookie atau secure redirect)
        return response.redirect().toPath(`http://${request.hostname()}:5173/?token=${token.value?.release()}`)
    }
}
