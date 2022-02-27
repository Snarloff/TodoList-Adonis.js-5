import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from "App/Models/User"

export default class AuthController {

  public async register({ request, response, auth }: HttpContextContract) {

    const userSchema = schema.create({
      username: schema.string({ trim: true }, [rules.unique({ table: 'users', column: 'username', caseInsensitive: true }), rules.minLength(5), rules.maxLength(100)]),
      email: schema.string({ trim: true }, [rules.email(), rules.unique({ table: 'users', column: 'email', caseInsensitive: true })]),
      password: schema.string({}, [rules.minLength(8)])
    })

    const messages = {
      'email.unique': 'O e-mail já está em uso!',
      'email.minLength': 'O e-mail deve conter ao menos 5 caracteres!',
      'email.maxLength': 'O e-mail deve conter no máximo 255 caracteres!',

      'password.confirm': 'A senha inserida está incorreta!',
      'password.minLength': 'A senha deve conter ao menos 6 caracteres!',
      'password.maxLength': 'A senha deve conter no máximo 180 caracteres!',

      'username.unique': 'O nome de usuário já está em uso!',
      'username.minLength': 'O nome de usuário deve conter ao menos 5 caracteres!',
      'username.maxLength': 'O nome de usuário deve conter no máximo 100 caracteres!',
    }

    let data: any;

    data = await request.validate({ schema: userSchema, messages})
 
    const user = await User.create(data)

    await auth.login(user)
    return response.redirect().back()

  }

  public async login({ request, response, auth, session }: HttpContextContract) {
    // grab uid and password values off request body
    const { uid, password } = request.only(['uid', 'password'])

    try {
      // attempt to login
      await auth.attempt(uid, password)
    } catch (error) {
      // if login fails, return vague form message and redirect back
      session.flash('form', 'Seu nome, email ou senha estão incorretos!')
      return response.redirect('/?loginError=true')
    }

    // otherwise, redirect to home page
    return response.redirect('/dashboard')
  }

  public async logout({ response, auth }: HttpContextContract) {
    // logout the user
    await auth.logout()
    return response.redirect('/')
  }
}
