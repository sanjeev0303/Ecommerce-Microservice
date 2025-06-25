FROM node:22-alpine AS builder


WORKDIR /app/products

COPY package*.json ./

RUN npm install

COPY . .

FROM node:22-alpine

WORKDIR /app/products

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8002

CMD [ "node", "src/index.js" ]
