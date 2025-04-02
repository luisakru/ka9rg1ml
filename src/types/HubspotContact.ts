export interface HubspotContact {
    id: string;
    properties: {
        createdate: string;
        email: string;
        firstname: string;
        hs_object_id: string;
        lastmodifieddate: string;
        lastname: string;
        phone?: string;
        company?: string;
        website?: string;
        lifecyclestage?: string;
    };
    createdAt: string;
    updatedAt: string;
    archived: boolean;
}
