import request from 'supertest';
import { app } from '..';
import { NewCustomer } from '../db/types';
import { insertCustomer } from '../services/dbService';
import { pool } from '../db/db';
import nock from 'nock';
import { logger } from '../utils/utils';
import { ADMIN_AUTH_TOKEN, ERROR_AUTH_TOKEN, HUBSPOT_API_URL, USER_AUTH_TOKEN } from '../config';

describe('Customer Routes', () => {
    afterEach(async () => {
        try {
            await pool.query("TRUNCATE TABLE customer RESTART IDENTITY CASCADE");
        } catch (error) {
            logger.error('❌ Error during truncate.', { error })
        }
    });

    describe('POST /', () => {
        it('should return status 201 and created customer', async () => {
            const email = 'test@example.com';
            const newCustomer = { email, firstname: 'Jenny', lastname: 'Doe' };
            nock(HUBSPOT_API_URL)
                .post('/crm/v3/objects/contacts')
                .reply(201, { email });

            const response = await request(app).post('/').set('Authorization', `Bearer ${ADMIN_AUTH_TOKEN}`).send(newCustomer);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(newCustomer));
        });

        it('should return 400 on validation error', async () => {
            const invalidCustomer = { email: 'invalidemail', firstname: '', lastname: '' };

            const response = await request(app)
                .post('/')
                .set('Authorization', `Bearer ${ADMIN_AUTH_TOKEN}`)
                .send(invalidCustomer);

            expect(response.status).toBe(400);
        });

        it('should return 403 if no authorized role', async () => {
            const customer = { email: 'test@example.com', firstname: 'Lu', lastname: 'Lian' };

            const response = await request(app).post('/').set('Authorization', `Bearer ${USER_AUTH_TOKEN}`).send(customer);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /:email', () => {
        it.each([ADMIN_AUTH_TOKEN, USER_AUTH_TOKEN])(
            'should return status 200 and customer when using correct token', async (token) => {
                const customerMock: NewCustomer = {
                    firstname: "Max",
                    lastname: "Mueller",
                    email: "max.mueller@example.com",
                };
                await insertCustomer(customerMock);

                const response = await request(app)
                    .get(`/${customerMock.email}`)
                    .set('Authorization', `Bearer ${token}`);

                expect(response.status).toBe(200);
                expect(response.body).toEqual(expect.objectContaining(customerMock));
            });

        it('should return 404 if customer not found', async () => {
            const response = await request(app)
                .get('/nonexistent@example.com')
                .set('Authorization', `Bearer ${ADMIN_AUTH_TOKEN}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Customer with email nonexistent@example.com not found');
        });
    });

    describe('PUT /:email', () => {
        it('should return status 200 on successful update', async () => {
            const customerMock: NewCustomer = {
                firstname: "Max",
                lastname: "Mueller",
                email: "max.mueller@example.com",
            };
            await insertCustomer(customerMock);
            const newFirstname = 'Udo;'
            nock(HUBSPOT_API_URL)
                .patch(`/crm/v3/objects/contacts/${customerMock.email}?idProperty=email`, (body) => {
                    expect(body).toEqual({ properties: { firstname: newFirstname } });
                    return true;
                })
                .reply(200, { firstname: newFirstname });

            const response = await request(app)
                .put(`/${customerMock.email}`)
                .set('Authorization', `Bearer ${ADMIN_AUTH_TOKEN}`)
                .send({ firstname: newFirstname });

            expect(response.status).toBe(200);
        });

        it('should return 403 if no authorized role', async () => {
            const response = await request(app)
                .put(`/test@example.com`)
                .set('Authorization', `Bearer ${USER_AUTH_TOKEN}`)
                .send({ firstname: 'Polly' });

            expect(response.status).toBe(403);
        });
    });

    it('should return 401 if user role not found', async () => {
        const response = await request(app)
            .put(`/test@example.com`)
            .set('Authorization', `Bearer ${ERROR_AUTH_TOKEN}`)
            .send({ firstname: 'Tina' });

        expect(response.status).toBe(401);
    });
});
