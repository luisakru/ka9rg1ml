import * as dbService from '../services/dbService';
import * as hubspotService from '../services/hubspotService';
import { Request, Response, NextFunction } from 'express';
import { getCustomer, postCustomer, putCustomer } from './customerController';
import nock from 'nock';
import { HUBSPOT_API_URL } from '../config';
import { HttpError } from '../types/HttpError';

const customerToCreate = { email: 'test@example.com', firstname: 'Jenny', lastname: 'Doe' };
const cutomerFromDb = {
    ...customerToCreate,
    uuid: '72219803-e71e-4848-8ff1-f89d1afc267b',
    phone: null,
    company: null,
    website: null,
    lifecyclestage: null,
    createdAt: '2025-03-31T19:20:09.448Z',
    updatedAt: '2025-03-31T19:20:09.448Z'
};

describe('Customer Controller', () => {
    describe('postCustomer', () => {
        it('should create a new customer', async () => {
            nock(HUBSPOT_API_URL)
                .post('/crm/v3/objects/contacts')
                .reply(201, { email: 'testuser@example.com' });
            const mockReq = { body: customerToCreate } as Request;
            const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;
            const insertCustomerSpy = jest.spyOn(dbService, 'insertCustomer').mockResolvedValue(cutomerFromDb);
            const createHubSpotContactSpy = jest.spyOn(hubspotService, 'createHubSpotContact');

            await postCustomer(mockReq, mockRes, mockNext);

            expect(insertCustomerSpy).toHaveBeenCalledWith(customerToCreate);
            expect(createHubSpotContactSpy).toHaveBeenCalledWith(customerToCreate);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining(customerToCreate));
        });

        it('should throw a 400 error, if customer creation fails', async () => {
            const mockReq = { body: { email: 'invalid', firstname: 'Toni', lastname: 'Doe' } } as Request;
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;

            await postCustomer(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
            }));
        });

        it('should throw a 408 error, if customer already exists in HubSpot', async () => {
            nock(HUBSPOT_API_URL)
                .post('/crm/v3/objects/contacts')
                .reply(409, {
                    status: 'error',
                    message: 'Contact already exists',
                    correlationId: 'some-correlation-id'
                });
            const mockReq = { body: customerToCreate } as Request;
            const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;

            await postCustomer(mockReq, mockRes, mockNext);

            const receivedError = (mockNext as jest.Mock).mock.calls[0][0];
            expect(receivedError).toBeInstanceOf(HttpError);
            expect(receivedError.statusCode).toBe(409);
            expect(receivedError.message).toBe('HubSpot API Error (409): Contact already exists');
        });
    });

    describe('getCustomer', () => {
        it('should return a customer', async () => {
            const mockReq = { params: { email: customerToCreate.email } } as unknown as Request;
            const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;
            const findCustomerByEmailSpy = jest.spyOn(dbService, 'findCustomerByEmail').mockResolvedValue(cutomerFromDb);

            await getCustomer(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(findCustomerByEmailSpy).toHaveBeenCalledWith(customerToCreate.email)
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining(customerToCreate));
        });

        it('should throw a 404 error, if customer not found', async () => {
            const nonExistingEmail = 'non-existing@example.com';
            const mockReq = { params: { email: nonExistingEmail } } as unknown as Request;
            const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;
            jest.spyOn(dbService, 'findCustomerByEmail').mockResolvedValue(undefined);

            await getCustomer(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 404,
                message: `Customer with email ${nonExistingEmail} not found`,
            }));
        });
    });

    describe('putCustomer', () => {
        it('should update a customer', async () => {
            const email = 'test@example.com';
            const firstname = 'Ida'
            nock(HUBSPOT_API_URL)
                .patch(`/crm/v3/objects/contacts/${email}?idProperty=email`, (body) => {
                    expect(body).toEqual({ properties: { firstname } });
                    return true;
                })
                .reply(200, { email });
            const mockReq = { params: { email }, body: { firstname } } as unknown as Request;
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;
            const updateCustomerSpy = jest.spyOn(dbService, 'updateCustomer');
            const updateHubSpotContactSpy = jest.spyOn(hubspotService, 'updateHubSpotContact');

            await putCustomer(mockReq, mockRes, mockNext);

            expect(updateCustomerSpy).toHaveBeenCalledWith(email, { firstname });
            expect(updateHubSpotContactSpy).toHaveBeenCalledWith(email, { firstname });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalled();
        });

        it('should throw a 400 error, if update fails', async () => {
            const mockReq = { params: { email: 'test@example.com' }, body: { firstname: '' } } as unknown as Request;
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() } as unknown as Response;
            const mockNext = jest.fn() as NextFunction;

            await putCustomer(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 400,
                message: 'Invalid body',
            }));
        });
    });
});
