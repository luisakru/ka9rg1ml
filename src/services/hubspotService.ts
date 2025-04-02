import axios, { AxiosError } from "axios";
import { CustomerUpdate, NewCustomer } from "../db/types";
import { HUBSPOT_ACCESS_TOKEN, HUBSPOT_API_URL } from "../config";
import { HttpError } from "../types/HttpError";
import { HubspotContact } from "../types/HubspotContact";

if (!HUBSPOT_ACCESS_TOKEN) {
  throw new Error("Missing HUBSPOT_ACCESS_TOKEN in .env file");
}

const axiosConfig = {
  headers: {
    Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
}

/**
 * @returns null if 404 Not Found error or throw error
 */
const handleAxiosError = (error: AxiosError) => {
  const message = ((error.response?.data as { message?: string })?.message || error.message || 'Unknown error');
  const status = error.response?.status ?? (error.request ? 504 : 502);

  if (status === 404) return;

  if (error.response) throw new HttpError(`HubSpot API Error (${status}): ${message}`, status);
  if (error.request) throw new HttpError(`No response from HubSpot: ${message}`, status);

  throw new HttpError(`Axios error: ${message}`, status);
}


export async function fetchHubspotContact(contactId: number) {
  try {
    const response = await axios.get(`${HUBSPOT_API_URL}/crm/v3/objects/contacts/${contactId}`, axiosConfig);
    return response.data as HubspotContact;
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw new HttpError('An unknown error occurred while fetching HubSpot contact', 500);
    }

    handleAxiosError(error);
  }
}

export async function createHubSpotContact(customer: NewCustomer) {
  try {
    return await axios.post(`${HUBSPOT_API_URL}/crm/v3/objects/contacts`, { properties: customer }, axiosConfig);
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw new HttpError('An unknown error occurred while creating HubSpot contact', 500);
    }

    handleAxiosError(error);
  }
}

export async function updateHubSpotContact(email: string, customer: CustomerUpdate) {
  try {
    return await axios.patch(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${email}?idProperty=email`,
      { properties: customer },
      axiosConfig
    );
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw new HttpError('An unknown error occurred while updating HubSpot contact', 500);
    }

    handleAxiosError(error);
  }
}