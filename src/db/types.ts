import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
    customer: CustomerTable
}

interface CustomerTable {
    uuid: Generated<string>;
    email: string;
    firstname: string;
    lastname: string;
    phone?: string | null;
    company?: string | null;
    website?: string | null;
    lifecyclestage?: string | null;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
}

export type Customer = Selectable<CustomerTable>
export type NewCustomer = Insertable<CustomerTable>
export type CustomerUpdate = Updateable<CustomerTable>