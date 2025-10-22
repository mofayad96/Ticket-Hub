FROM node:22-alpine

WORKDIR /app2

COPY backend/package*.json ./

RUN npm ci 

COPY backend/ .

EXPOSE 9000

CMD [ "npm","start" ]
