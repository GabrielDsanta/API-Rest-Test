import { server} from './app'
import { env } from './env'

server.listen({
    port: env.PORT
}).then(() => {
    console.log('server is running at 3333')
})