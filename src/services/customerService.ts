import { AxiosResponse } from "axios";
import { HttpError } from "../types/HttpError";
import { CustomerRequestBody } from "../validators/customerValidator";
import { createHubSpotContact, updateHubSpotContact } from "./hubspotService";
import { findCustomerByEmail, insertCustomer, updateCustomer } from "./dbService";

interface HandleRejectionErrorParams {
    hubspotResponse: PromiseSettledResult<AxiosResponse | null | undefined>,
    customer: PromiseSettledResult<any>,
    message: string
}

function generateError(
    { hubspotResponse, customer, message }: HandleRejectionErrorParams
) {
    const error = hubspotResponse.status === "rejected"
        ? hubspotResponse.reason
        : (customer as PromiseRejectedResult).reason;

    if (error instanceof HttpError) return error;

    return new HttpError(message, 500);
};

export async function createCustomer(validCustomer: CustomerRequestBody) {
    const [hubspotResponse, createdCustomer] = await Promise.allSettled([
        createHubSpotContact(validCustomer),
        insertCustomer(validCustomer)
    ]);

    if (hubspotResponse.status === 'rejected' || createdCustomer.status === 'rejected') {
        const message = 'Error creating customer';
        throw generateError({ hubspotResponse, customer: createdCustomer, message });
    }

    if (!createdCustomer.value || !hubspotResponse.value || hubspotResponse.value.status !== 201) {
        throw new HttpError('Error creating customer', 500);
    }

    return createdCustomer.value;
}

export async function fetchCustomer(email: string) {
    const customer = await findCustomerByEmail(email);
    if (!customer) throw new HttpError(`Customer with email ${email} not found`, 404);
    return customer;
}

export async function modifyCustomer(email: string, validCustomer: Partial<CustomerRequestBody>) {
    const [updateCustomerResult, hubspotResponse] = await Promise.allSettled([
        updateCustomer(email, validCustomer),
        updateHubSpotContact(email, validCustomer),
    ]);

    if (updateCustomerResult.status === 'rejected' || hubspotResponse.status === 'rejected') {
        const message = 'Error updating customer';
        generateError({ hubspotResponse, customer: updateCustomerResult, message });
    }
}