import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    DATABASE_URL: z.string(),
    PORT: z.number().default(3333),
})

const isEnvValid =  envSchema.safeParse(process.env)

if(isEnvValid.success === false){
    console.error(`Invalid environment variable ! ${isEnvValid.error.format()}`)
    throw new Error('Invalid environment variable !')
}

export const env = isEnvValid.data