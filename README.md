# Main Backend service for Screetner

## Environment Variables

- DATABASE_URL= Postgres connection string
- JWT_SECRET= some secret key for JWT
- JWT_REFRESH_SECRET= some secret key for JWT refresh token
- JWT_TUSD_SECRET= some secret key for JWT tusd token
- JWT_INVITE_SECRET= some secret key for JWT invite token
- FN_URL= frontend URL the build email button redirects to for register
- COMMUNICATION_SERVICES_CONNECTION_STRING= string connection to azure communication services
- OWNER_ORGANIZATION_NAME=Screetner
- SERVICE_LOG_URL= URL to the service log
- AZURE_ACCOUNT_NAME= name of the azure storage account
- AZURE_ACCOUNT_KEY= azure storage account key
- AZURE_CONTAINER_NAME= container name for azure storage
- BLOB_BASE_PATH= https://AZURE_ACCOUNT_NAME.blob.core.windows.net/AZURE_CONTAINER_NAME
- PYTHON_DETECTION_PATH= url to request logic app
- REDIS_URL= redis connection string

## How to run on development

1. Clone the repository
2. Install dependencies using `bun install`
3. Create a `.env` file in the root directory and add the values following `.env.example`
4. Run the development server using `bun run dev`

## How to build docker image

1. Run `docker build -t IMAGENAME .` to build the image

### Where to use

- This image will be used in the `scn-deployment` repository to deploy the `scn-main-backend`
