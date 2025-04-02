import { CustomerUpdate, NewCustomer } from "../db/types";
import { closeDbConnection, db, pool } from "../db/db";
import { insertCustomer, findCustomerByEmail, updateCustomer } from "./dbService";
import { logger } from "../utils/utils";

describe("DB Service", () => {
    const customerMock: NewCustomer = {
        firstname: "Max",
        lastname: "Mueller",
        email: "max.mueller@example.com",
    };

    afterEach(async () => {
        try {
            await pool.query("TRUNCATE TABLE customer RESTART IDENTITY CASCADE");
        } catch (error) {
            logger.error('❌ Error during truncate', { error })
        }
    });

    afterAll(async () => {
        await closeDbConnection();
    });

    it("should create a customer", async () => {
        const createdCustomer = await insertCustomer(customerMock);

        const result = await db.selectFrom('customer').selectAll().execute();

        expect(result.length).toBe(1);
        expect(result[0]).toEqual(createdCustomer)
    });

    it("should find a customer by email", async () => {
        const createdCustomer = await insertCustomer(customerMock);

        const result = await findCustomerByEmail(customerMock.email);

        expect(result).toEqual(createdCustomer)
    });

    it("should update a required field of a customer by email", async () => {
        await insertCustomer(customerMock);

        const customerUpdateMock: CustomerUpdate = {
            lastname: "Miller",
        };

        await updateCustomer(customerMock.email, customerUpdateMock);

        const result = await findCustomerByEmail(customerMock.email);
        expect(result?.lastname).toEqual(customerUpdateMock.lastname)
    });

    it("should update an optional field of a customer by email", async () => {
        await insertCustomer(customerMock);

        const customerUpdateMock: CustomerUpdate = {
            company: "autarc",
        };

        await updateCustomer(customerMock.email, customerUpdateMock);

        const result = await findCustomerByEmail(customerMock.email);
        expect(result?.company).toEqual(customerUpdateMock.company)
    });
});
