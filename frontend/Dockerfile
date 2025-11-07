FROM node:22-alpine
WORKDIR /app


COPY package*.json ./
RUN npm ci


COPY . .

# accept VITE as a build-time var
ARG VITE_API_URL

#sets VITE_API as an var at run-time
ENV VITE_API_URL=${VITE_API_URL}


RUN npm run build


RUN npm install -g serve


EXPOSE 3000

# Serve the built files
CMD ["serve", "-s", "dist", "-l", "3000"]