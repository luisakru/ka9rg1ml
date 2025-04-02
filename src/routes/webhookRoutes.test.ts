import request from 'supertest';
import { SubscriptionType } from '../types/HubspotEvent';
import * as webhookService from '../services/webhookService';
import { webhookApp } from '../webhookServer';

describe('Webhook Routes', () => {
    it('should process the event and return 200 status', async () => {
        const mockEvent = [{ objectId: "contactId", subscriptionType: SubscriptionType.CONTACT_CREATION }];
        const processHubspotEventSpy = jest.spyOn(webhookService, 'processHubspotEvent').mockResolvedValue(undefined);

        const response = await request(webhookApp)
            .post('/')
            .send(mockEvent);

        expect(response.status).toBe(200);
        expect(processHubspotEventSpy).toHaveBeenCalledWith(mockEvent[0]);
    });

    it('should return 500 status when there is an error in processing the event', async () => {
        const mockEvent = [{ objectId: "contactId", subscriptionType: SubscriptionType.CONTACT_CREATION }];
        jest.spyOn(webhookService, 'processHubspotEvent').mockResolvedValue(undefined);

        const response = await request(webhookApp)
            .post('/non-existing')
            .send(mockEvent);

        expect(response.status).toBe(500);
    });
});
