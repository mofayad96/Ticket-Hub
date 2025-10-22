FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci


COPY backend/ .


RUN npm run build


RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
