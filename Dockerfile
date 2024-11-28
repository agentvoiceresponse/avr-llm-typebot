FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine AS build

WORKDIR /usr/src/app

RUN apk update && apk add --no-cache ffmpeg

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node index.js index.js

USER node

CMD [ "node", "index.js" ]