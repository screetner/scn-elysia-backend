import { EmailClient } from "@azure/communication-email";

const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;

if (!connectionString) {
    throw new Error("COMMUNICATION_SERVICES_CONNECTION_STRING is not defined");
}

const client = new EmailClient(connectionString);

export default client;