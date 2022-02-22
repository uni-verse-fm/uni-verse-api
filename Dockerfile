### DEV ###
FROM node:16-alpine
# Safer workdir
WORKDIR /usr/src/app
# Copy package.json and package-lock.json
COPY ./package*.json ./

RUN npm install
# Copy source code
COPY . .