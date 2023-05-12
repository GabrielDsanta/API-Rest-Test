import fastify from 'fastify'
import { knex } from './database'
import crypto from 'node:crypto'
import { env } from './env'

const server = fastify()

server.get('/hello', async () => {
    const transaction = await knex('transactions').insert({
        id: crypto.randomUUID(),
        title: 'Transação Teste',
        amount: 1,
    }).returning('*')

    return transaction
})

server.listen({
    port: env.PORT
}).then(() => {
    console.log('server is running at 3333')
})