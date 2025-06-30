import { Hono } from 'hono'
import { auth, AuthType } from '../../lib/auth'

const betterAuthRouter = new Hono<{ Bindings: AuthType }>({
  strict: false,
})

betterAuthRouter.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export default betterAuthRouter;