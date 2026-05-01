FROM node:22-alpine 

WORKDIR /app

COPY backend .

RUN npm install

RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]