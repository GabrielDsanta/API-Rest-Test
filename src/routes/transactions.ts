import { FastifyInstance } from "fastify"
import { knex } from "../database"
import { z } from 'zod'
import crypto from 'node:crypto'
import cookie from '@fastify/cookie'
import { sessionIdValidation } from "../middlewares/session-id-validation"


export async function transactionsRoutes(server: FastifyInstance) {
    server.get('/',
        {
            preHandler: [sessionIdValidation]
        },
        async (request) => {
            const { sessionId } = request.cookies
            const transactions = await knex('transactions').where('session_id', sessionId).select()

            return { transactions }
        }
    )

    server.get('/:id',
        {
            preHandler: [sessionIdValidation]
        },
        async (request) => {
            const { sessionId } = request.cookies
            const getTransactionParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getTransactionParamsSchema.parse(request.params)
            const transaction = await knex('transactions').where({
                id,
                session_id: sessionId
            }).first()

            return { transaction }
        }
    )

    server.get('/summary',
        {
            preHandler: [sessionIdValidation]
        },
        async (request) => {
            const { sessionId } = request.cookies
            const summary = await knex('transactions').where('session_id', sessionId).sum('amount', {
                as: 'amount'
            }).first()

            return { summary }
        }
    )

    server.post('/', async (request, reply) => {

        const createTransactionsBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        const { title, amount, type } = createTransactionsBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = crypto.randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId,
        })

        return reply.status(201).send()
    }
    )
}