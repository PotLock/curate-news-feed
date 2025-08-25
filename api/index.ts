import { handle } from 'hono/vercel'
import app from "../apps/server/src/index";

export default handle(app);