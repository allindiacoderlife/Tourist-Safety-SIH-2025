FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]