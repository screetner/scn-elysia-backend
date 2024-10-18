FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY src src
COPY tsconfig.json .

USER node
COPY --chown=node:node src ./src
COPY --chown=node:node tsconfig.json ./

CMD ["bun", "src/index.ts"]

EXPOSE 3000
