import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest'
import { server } from '../src/app'
import request from 'supertest'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await server.ready()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback')
        execSync('npm run knex migrate:latest')
    })

    afterAll(async () => {
        await server.close()
    })

    it('user can create a new transaction', async () => {
        await request(server.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)
    })

    it('should be able to list all transactions', async () => {
        const createTransationRespose = await request(server.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit'
            })

        const cookies = createTransationRespose.get('Set-Cookie')

        const listTransactions = await request(server.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        expect(listTransactions.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        ])

    })
})