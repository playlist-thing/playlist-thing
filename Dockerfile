FROM node:22-alpine3.20 AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine3.20 AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

FROM node:22-alpine3.20 AS app

WORKDIR /app
COPY package.json ./
COPY --from=build /app/build ./build

ENV NODE_ENV=production

ENTRYPOINT ["node", "build"]
