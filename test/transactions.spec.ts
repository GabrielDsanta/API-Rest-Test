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

    it('should be able to get a specific transaction', async () => {
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

        const transactionId = listTransactions.body.transactions[0].id

        const getTransactionResponse = await request(server.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        )

    })

    it('should be able to get a summary', async () => {
        const createTransationRespose = await request(server.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit'
            })

        const cookies = createTransationRespose.get('Set-Cookie')

        await request(server.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
                title: 'Debit transaction',
                amount: 2000,
                type: 'debit'
            })

        const summaryResponse = await request(server.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200)

        expect(summaryResponse.body.summary).toEqual({
            amount: 3000
        })

    })
})