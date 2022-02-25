FROM node:16-alpine as builder

WORKDIR /usr/src/app

COPY ./package*.json ./
RUN npm ci

COPY . .

RUN npm run prebuild
RUN npm run build

RUN npm prune --production

FROM node:16-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist


CMD ["npm", "run", "start:prod"]
