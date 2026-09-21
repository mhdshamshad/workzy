FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
RUN mkdir -p logs

EXPOSE 3001
CMD ["node", "dist/server.js"]