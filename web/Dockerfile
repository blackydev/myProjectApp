FROM node:lts-alpine3.17

RUN addgroup app && adduser -S -G app app
USER app

WORKDIR /app
COPY package*.json ./
COPY --chown=app:node package*.json ./
RUN npm install
COPY --chown=app:node . .
COPY . . 

EXPOSE 3000 

CMD ["npm", "run", "dev"]
