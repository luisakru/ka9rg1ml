# HubSpot Integration - API and Webhook

## Description
This is a simple API with a HubSpot integration using a Postgres database and webhooks.

The project consits out of two services:
- **API:** create, read, update customer records in Postgres, should keep HubSpot in sync
- **Webhook:** consume Webhook from HubSpot to sync customer records in Postgres db

**Synchronization Logic:**
- **Inbound Sync (Webhook → Postgres):** When HubSpot sends a webhook event, the service updates the local Postgres database.
- **Outbound Sync (API → HubSpot):** When the API creates or update a customer in Postgres, it makes an API request to create or update the corresponding record in HubSpot.

## API

Start API server (`localhost:8080`): `yarn start`

### API Endpoints

#### `POST` `/`

*Creates a new customer by first validating the provided data, then creating a corresponding customer in both the database and HubSpot.*

##### Request body example:
```
{
    "email": "example@hubspot.com", // Required
    "firstname": "Jane", // Required
    "lastname": "Doe", // Required
    "phone": "(555) 555-5555",
    "company": "HubSpot",
    "website": "hubspot.com",
    "lifecyclestage": "marketingqualifiedlead"
}
```

##### Response:
- **201 Created**
  - The customer was successfully created.
  - Body:
    ```
    {
      "uuid": "b0e58e97-e282-437f-afae-d93d82c1c09a",
      "email": "uwe@hubspot.com",
      "firstname": "Uwe",
      "lastname": "Krueger",
      "phone": "(555) 555-5555",
      "company": "Tier",
      "website": null,
      "lifecyclestage": null,
      "createdat": "2025-04-01T22:07:32.505Z",
      "updatedat": "2025-04-01T22:07:32.505Z"
    }
    ```
- **400 Bad Request**
  - Invalid request body. 
  - Body: 
    ```
    {
      "message": "Invalid body"
    }
    ```
- **409 Conflict**
  - The customer already exists in HubSpot. 
  - Body: 
    ```
    {
        "message": "HubSpot API Error (409): Contact already exists. Existing ID: 245634182382"
    }
    ```
- **500 Internal Server Error**
  - An error occurred while creating the customer, either in the database or in HubSpot.
  - Body: 
    ```
    {
        "message": "Error creating customer"
    }
    ```

#### `GET` `/:email`

*Fetches a customer by their email address.*

##### Response:
- **200 OK**
  - The customer was found and is returned in the response.
  - Body:
    ```
    {
        "uuid": "72219803-e71e-4848-8ff1-f89d1afc267b",
        "email": "example@hubspot.com",
        "firstname": "Karin",
        "lastname": "Doe",
        "phone": "(555) 555-5555",
        "company": "HubSpot",
        "website": "https://community.hubspot.com/",
        "lifecyclestage": "marketingqualifiedlead",
        "createdat": "2025-03-31T19:20:09.448Z",
        "updatedat": "2025-03-31T19:20:09.448Z"
    }
    ```
- **404 Not Found**
  - The customer with the provided email was not found.
  - Body: 
    ```
    {
        "error": "Customer with email kai@hubspot.com not found"
    }
    ```

#### `PUT` `/:email`

*Updates an existing customer in both the database and HubSpot based on the provided email.*

Request body example:
```
{
    "firstname": "Christa",
}
```

##### Response:
- **200 OK**
  - The customer was successfully updated.
  - Body: Empty
- **400 Bad Request**
  - Invalid request body. 
  - Body: 
    ```
    {
        "message": "HubSpot API Error (400): No properties found to update, please provide at least one."
    }
    ```
- **500 Internal Server Error**
  - An error occurred while updating the customer in either the database or HubSpot.
  - Body: 
    ```
    {
        "message": "Error updating customer"
    }
    ```

### Note
There's another endpoint `GET /get-token/:role` for generating authentication tokens. Simply provide the desired role (*admin* or *user*) as a parameter. The generated token expires after 1 hour. A user can only access GET /:email, while an admin has full access to all endpoints.

## Webhook

### Expose local webhook url
1. Start webhook server (`localhost:8080`): `yarn start:webhook`.

1. Use `ngrok` to expose your local server:
    - Sign up for an account: https://dashboard.ngrok.com/signup
    - Authtoken: Getting Started > Your Authtoken
    - Authenticate your ngrok agent (only needed once): `npx ngrok config add-authtoken <your-authtoken>`
    - Expose local server: `yarn expose`

### Connect local webhook url with HubSpot webhook
1. Login into HubSpot
1. user-preferences > Integrations > Private App
1. Select your app
1. Go to Webhooks
1. Create one and paste the URL that was created with ngrok

## Local DB

### Start local DB and run migrations
`yarn db:start`

### Connect to local DB
`docker exec -it customer-db psql -U user -d customerdb`

- List tables: `\dt`
- View table structure: `\d customer`
- Select data from a table: `SELECT * FROM customer;`

### Delete local DB
1. `docker volume ls`
2. `docker volume rm <VOLUME_NAME>`


## Testing

### Functional and unit tests
**Setup:** To run the tests locally, you need a running PostgreSQL database and the migrations have to be succeeded. (See: Local DB > Start local DB)

Run the tests: `yarn test`.

### Manual testing

#### Webhook
1. Follow the steps of `Webhook > Expose local webhook url`
1. Follow the steps of `Local DB > Connect to local DB`
1. Create and update manually contacts in HubSpot.
1. Check in the local postgres DB if the customers will be updated and created as expected.

### API
1. Follow the steps of `Webhook > Expose local webhook url`
1. Send a request to the API. You can use the `api.postman_collection.json`. 
1. Check in HubSpot the contacts will be updated and created as expected.

## Potential Improvements
While the current implementation meets the requirements, there are several enhancements that could be made if there were more time:
- **Adding `updatedAt` and `createdAt` from HubSpot Contact to the Database:** These timestamps could be useful for tracking when the contact was created or last updated in HubSpot.
- **Storing `contactId` from HubSpot in the Database:** Storing the HubSpot contact ID in the database would allow for easier reference and synchronization between the two systems.
- **Batching DB Queries and HubSpot Requests:** Add an endpoint for batching DB queries and HubSpot calls. This would improve performance, especially when dealing with a large volume of data.
- **Improved Handling of HubSpot Events:** When the API receives a contact creation requst it creates a contact in HubSpot and a customer in Postgres Db, HubSpot then triggers an event to create the customer in Postgres (again). This flow could be managed more effectively. 
- **Ensuring Success in Both Systems (HubSpot and DB):** Currently, it's possible that one system succeeds while the other fails (e.g., a customer is created in HubSpot but not in the database). Ensuring that both operations succeed or fail together is important for data consistency.
- **Test Without Local DB:** While tests are in place, these could be expanded to avoid requiring a local database.
- **Access Token Management:** It's important to note that, in a production environment the access token should not be stored in the .env file. Instead, it should be securely managed using a secrets management solution or environment-specific variables.
- **Async Operation Bug in Jest:** There's an issue where Jest doesn't exit after tests due to unfinished async operations. This is something I would fix if I had more time.
- **Linting and Formatting:** Better linting and formatting (e.g., ESLint, Prettier) to ensure consistent code quality.