import { NewCustomer, CustomerUpdate } from "../db/types";
import { insertCustomer, updateCustomer } from "../services/dbService";
import { fetchHubspotContact } from "../services/hubspotService";
import { HubspotContact } from "../types/HubspotContact";
import { HubspotEvent, SubscriptionType } from "../types/HubspotEvent";
import { logger } from "../utils/utils";

export async function getHubspotContact(contactId: number) {
    const hubspotContact = await fetchHubspotContact(contactId);
    if (!hubspotContact) {
        logger.warn(`No HubSpot contact found with contactId ${contactId}`);
    }
    return hubspotContact;
};

async function handleContactCreation(hubspotContact: HubspotContact) {
    const { email, firstname, lastname, phone, company, website, lifecyclestage } = hubspotContact.properties;
    const customer: NewCustomer = { email, firstname, lastname, phone, company, website, lifecyclestage };
    await insertCustomer(customer);
};

export async function handleContactPropertyChange(event: HubspotEvent, hubspotContact: HubspotContact) {
    if (!event.propertyName || !event.propertyValue) {
        logger.warn('No propertyName or propertyValue in event', { event });
        return;
    }

    const customer: CustomerUpdate = {
        [event.propertyName]: event.propertyValue,
    };
    await updateCustomer(hubspotContact.properties.email, customer);
};

export const processHubspotEvent = async (event: HubspotEvent) => {
    const { objectId: contactId, subscriptionType } = event;

    const hubspotContact = await getHubspotContact(contactId);
    if (!hubspotContact) return;

    if (subscriptionType === SubscriptionType.CONTACT_CREATION) {
        await handleContactCreation(hubspotContact);
    } else if (subscriptionType === SubscriptionType.CONTACT_PROPERTY_CHANGE) {
        await handleContactPropertyChange(event, hubspotContact);
    }
};
