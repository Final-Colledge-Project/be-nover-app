import 'dotenv/config'
import App from './app'
import { IndexRoute } from '@modules/index'
import { validateEnv } from '@core/utils'
import UsersRoute from '@modules/users/user.route'


validateEnv()

const routes = [
  new IndexRoute(),
  new UsersRoute()
]

const app = new App(routes)

app.listen();
