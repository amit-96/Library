# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx conf if needed, or use default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
