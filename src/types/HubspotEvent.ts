export enum SubscriptionType {
    CONTACT_CREATION = 'contact.creation',
    CONTACT_PROPERTY_CHANGE = 'contact.propertyChange',
}

export interface HubspotEvent {
    appId: number;
    eventId: number;
    subscriptionId: number;
    portalId: number;
    occurredAt: number;
    subscriptionType: SubscriptionType;
    attemptNumber: number;
    objectId: number;
    changeSource: string;
    changeFlag?: string; // Only for 'contact.creation'
    propertyName?: string; // Only for 'contact.propertyChange'
    propertyValue?: string; // Only for 'contact.propertyChange'
    sourceIds?: string; // Only for 'contact.propertyChange'
}