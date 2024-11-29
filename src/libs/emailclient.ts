import { EmailClient } from '@azure/communication-email'

const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING']
const client = new EmailClient(connectionString!)

export default client
