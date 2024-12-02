import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import * as routes from '@/routes'
import { jwt } from '@elysiajs/jwt'
import { Logestic } from 'logestic'
import { loadEnv } from '@/utils/loadEnv'

loadEnv()

new Elysia()
  .use(Logestic.preset('common'))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'secret',
    }),
  )
  .use(
    swagger({
      documentation: {
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
      // provider: 'swagger-ui'
    }),
  )
  .use(routes.auth)
  .use(routes.geolocation)
  .use(routes.sample)
  .use(routes.asset)
  .use(routes.role)
  .use(routes.user)
  .use(routes.tusd)
  .use(routes.member)
  .use(routes.dashboard)
  .use(routes.register)
  .use(routes.organization)
  .use(routes.videoSession)
  .use(routes.python)
  .get('/', () => 'Hello Elysia')
  .listen(3000)

console.log('server is running on http://localhost:3000')
