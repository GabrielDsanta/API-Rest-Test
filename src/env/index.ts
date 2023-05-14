import { config } from 'dotenv'
import { z } from 'zod'

if(process.env.NODE_ENV === 'test'){
    config({
        path: '.env.test'
    })
} else{
    config()
}

const envSchema = z.object({
    DATABASE_URL: z.string(),
    DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
    PORT: z.coerce.number().default(3333),
})

const isEnvValid =  envSchema.safeParse(process.env)

if(isEnvValid.success === false){
    console.error(`Invalid environment variable ! ${isEnvValid.error.format()}`)
    throw new Error('Invalid environment variable !')
}

export const env = isEnvValid.data