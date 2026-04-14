# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Inject production environment variables for the static build
RUN VITE_REALTIME_URL=https://stadiumiq-realtime-3ipfsmyiba-el.a.run.app \
    VITE_API_URL=https://stadiumiq-core-api-3ipfsmyiba-el.a.run.app \
    npm run build

# Stage 2: Runtime
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Standard Nginx config for SPAs
RUN printf "server { \n\
    listen 80; \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html; \n\
        try_files \$uri \$uri/ /index.html; \n\
    } \n\
}" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
