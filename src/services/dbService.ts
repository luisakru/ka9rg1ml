import { db } from "../db/db";
import { CustomerUpdate, NewCustomer } from "../db/types";
import { logger } from "../utils/utils";

const TABLE_NAME = 'customer';

export async function insertCustomer(customer: NewCustomer) {
    try {
        return await db.insertInto(TABLE_NAME)
            .values(customer)
            .returningAll()
            .executeTakeFirstOrThrow();
    } catch (error) {
        // Workaround for the following case:
        // When the API receives a contact creation requst it creates a contact in HubSpot and a customer in 
        // Postgres Db, HubSpot then triggers an event to create the customer in Postgres (again). 
        if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
            logger.warn('Customer already exists in DB', { error });
            return;
        }
        throw error;
    }
}

export async function findCustomerByEmail(email: string) {
    try {
        return await db.selectFrom(TABLE_NAME)
            .where('email', '=', email)
            .selectAll()
            .executeTakeFirst();
    } catch (error) {
        throw error;
    }
}

export async function updateCustomer(email: string, updateWith: CustomerUpdate) {
    try {
        await db.updateTable(TABLE_NAME)
            .set(updateWith)
            .where('email', '=', email)
            .execute();
    } catch (error) {
        throw error;
    }
}
