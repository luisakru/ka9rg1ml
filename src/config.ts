import dotenv from "dotenv";

dotenv.config();

export const API_PORT = process.env.NODE_ENV === "test" ? process.env.TEST_PORT || 8081 : process.env.PORT || 8080;
export const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3000;

export const DB_URL = process.env.DB_URL;

export const HUBSPOT_API_URL = process.env.HUBSPOT_API_URL || 'https://api.hubapi.com';
export const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export const SECRET_KEY = process.env.SECRET_KEY || 'secret';

export const ADMIN_AUTH_TOKEN = process.env.ADMIN_AUTH_TOKEN;
export const USER_AUTH_TOKEN = process.env.USER_AUTH_TOKEN;
export const ERROR_AUTH_TOKEN = process.env.ERROR_AUTH_TOKEN;
