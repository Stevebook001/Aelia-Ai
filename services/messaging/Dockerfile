FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV NODE_ENV=production
RUN mkdir -p /data/whatsapp-auth
VOLUME ["/data"]
EXPOSE 3100
CMD ["npm","start"]
