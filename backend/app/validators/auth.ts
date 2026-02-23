import vine from '@vinejs/vine'
/*
* Validasi pendaftaran
  */

export const registerValidator = vine.compile(
    vine.object({
        fullName:
            vine.string().trim().minLength(3).maxLength(100),
        email:
            vine.string().email().unique({ table: 'users', column: 'email' }),
        password:
            vine.string().minLength(8),
    })
)

/*
* Validasi Login
*/

export const loginValidator = vine.compile(
    vine.object({
        email:
            vine.string().email(),
        password:
            vine.string(),
    })
)