FROM node:22-alpine

WORKDIR /app2

COPY frontend/package*.json ./

RUN npm ci 

COPY frontend/ .

EXPOSE 9000

CMD [ "npm","start" ]
