import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'

export default class TasksController {

  public async index({ view, auth }: HttpContextContract) {
    const userId = auth.user?.id
    const tasks = await Task.query().where('user_id', userId || '').orderBy('id', 'desc')
    return view.render('dashboard', { tasks })
  }

  public async store({ response, request, auth, session }: HttpContextContract) {

    const data = request.only(['title', 'description'])    

    try {
      await Task.create({ user_id: auth.user?.id,...data })
    } catch (error) {
      session.flash('task_error', `An error has occurred: ${error}`)
      return response.redirect().back()
    }

    session.flash('task_success', 'Task added successfully!')
    return response.redirect().back()

  }

  public async destroy({ response, params, session }: HttpContextContract) {

    const id = params.id
    const task = await Task.findOrFail(id)

    await task.delete()
    session.flash('alert', 'The task was successfully removed!')

    return response.redirect().back()

  }

  public async status({ response, request, session }: HttpContextContract) {

    /*
      TODO: Add another where checking if the user_id matches the task id
    */

    const id = request.param('id')
    const status = request.param('status')
    
    const task = await Task.findOrFail(id)
    await task.merge({ status }).save()

    session.flash('alert', 'Status has been changed successfully!')
    return response.redirect().back()

  }

  public async edit({ response, request, session }: HttpContextContract) {

    const { title, description, id } = request.only(['title', 'description', 'id'])

    const task = await Task.findOrFail(id)
    await task.merge({ title, description }).save()

    session.flash('alert', 'The task was successfully edited!')
    return response.redirect().back()

  }

}
