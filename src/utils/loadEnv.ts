type ENV = {
  DATABASE_URL?: string
  JWT_SECRET?: string
  JWT_REFRESH_SECRET?: string
  JWT_TUSD_SECRET?: string
  JWT_INVITE_SECRET?: string
  FN_URL?: string
  COMMUNICATION_SERVICES_CONNECTION_STRING?: string
  OWNER_ORGANIZATION_NAME?: string
  SERVICE_LOG_URL?: string
  AZURE_ACCOUNT_NAME?: string
  AZURE_ACCOUNT_KEY?: string
  AZURE_CONTAINER_NAME?: string
  BLOB_BASE_PATH?: string
}

export function loadEnv() {
  // Dynamically fetch all keys from the ENV type
  const requiredEnv = Object.keys({
    DATABASE_URL: true,
    JWT_SECRET: true,
    JWT_REFRESH_SECRET: true,
    JWT_TUSD_SECRET: true,
    JWT_INVITE_SECRET: true,
    FN_URL: true,
    COMMUNICATION_SERVICES_CONNECTION_STRING: true,
    OWNER_ORGANIZATION_NAME: true,
    SERVICE_LOG_URL: true,
    AZURE_ACCOUNT_NAME: true,
    AZURE_ACCOUNT_KEY: true,
    AZURE_CONTAINER_NAME: true,
    BLOB_BASE_PATH: true,
  }) as (keyof ENV)[]

  const missingVars: string[] = []

  requiredEnv.forEach(key => {
    if (!process.env[key]) {
      missingVars.push(key)
    }
  })

  if (missingVars.length > 0) {
    console.error(
      `The following required environment variables are missing: ${missingVars.join(', ')}`,
    )
    process.exit(1) // Terminate the process
  }

  console.log('All required environment variables are set.')
}
