# ---- Build Angular ----
FROM node:26-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG BUILD_CONFIGURATION=production
RUN npm run build -- --configuration=${BUILD_CONFIGURATION}

# ---- Serve with Nginx ----
FROM nginx:alpine

# Angular (builder @angular/build:application) sort souvent dans dist/<app>/browser
COPY --from=build /app/dist/ressource-relationnelle/browser /usr/share/nginx/html

# SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]