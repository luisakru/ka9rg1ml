import * as hubspotService from "../services/hubspotService";
import { HubspotContact } from "../types/HubspotContact";
import { HubspotEvent, SubscriptionType } from "../types/HubspotEvent";
import { logger } from "../utils/utils";
import * as dbService from "./dbService";
import { getHubspotContact, handleContactPropertyChange } from "./webhookService";

jest.mock("../utils/utils", () => ({
    logger: {
        warn: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
    },
}));

const dummyHubspotEvent: HubspotEvent = {
    appId: 12345,
    eventId: 67890,
    subscriptionId: 111213,
    portalId: 141516,
    occurredAt: Date.now(),
    subscriptionType: SubscriptionType.CONTACT_CREATION,
    attemptNumber: 1,
    objectId: 987654321,
    changeSource: "API",
};

const dummyHubspotContact: HubspotContact = {
    id: '245562862808',
    properties: {
        createdate: '2025-04-01T19:49:36.728Z',
        email: 'johanna@hello.de',
        firstname: 'Johanna',
        hs_object_id: '245562862808',
        lastmodifieddate: '2025-04-01T19:49:36.728Z',
        lastname: 'Berndt'
    },
    createdAt: '2025-04-01T19:49:36.728Z',
    updatedAt: '2025-04-01T19:49:36.728Z',
    archived: false
}

describe("Webhook Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getHubspotContact', () => {
        it('should return the hubspot contact when found', async () => {
            jest.spyOn(hubspotService, 'fetchHubspotContact').mockResolvedValue(dummyHubspotContact);

            const result = await getHubspotContact(123);
            expect(result).toEqual(dummyHubspotContact);
            expect(logger.warn).not.toHaveBeenCalled();
        });

        it('should log a warning and return null if no contact is found', async () => {
            jest.spyOn(hubspotService, 'fetchHubspotContact').mockResolvedValue(null);

            const result = await getHubspotContact(123);
            expect(result).toBeNull();
            expect(logger.warn).toHaveBeenCalledWith('No HubSpot contact found with contactId 123');
        });
    });

    describe('handleContactPropertyChange', () => {
        it('should update the customer when propertyName and propertyValue are provided', async () => {
            const event = { ...dummyHubspotEvent, propertyName: "phone", propertyValue: "9876543210" };
            const updateCustomerSpy = jest.spyOn(dbService, 'updateCustomer');

            await handleContactPropertyChange(event, dummyHubspotContact);

            expect(updateCustomerSpy).toHaveBeenCalledWith(
                dummyHubspotContact.properties.email,
                { phone: event.propertyValue }
            );
        });

        it('should log a warning if propertyName or propertyValue is missing', async () => {
            const invalidEvent = { ...dummyHubspotEvent, propertyName: '', propertyValue: '' };
            const updateCustomerSpy = jest.spyOn(dbService, 'updateCustomer');

            await handleContactPropertyChange(invalidEvent, dummyHubspotContact);

            expect(logger.warn).toHaveBeenCalledWith('No propertyName or propertyValue in event', { event: invalidEvent });
            expect(updateCustomerSpy).not.toHaveBeenCalled();
        });
    });
});