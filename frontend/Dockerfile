# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/health || exit 1

CMD ["/bin/sh", "-c", "if [ -n \"$VITE_API_URL\" ]; then sed -i \"s|http://localhost:5005|$VITE_API_URL|g\" /usr/share/nginx/html/assets/*.js && sed -i \"s|http://localhost:5000|$VITE_API_URL|g\" /usr/share/nginx/html/assets/*.js; fi && if [ -n \"$VITE_SOCKET_URL\" ]; then sed -i \"s|http://localhost:5006|$VITE_SOCKET_URL|g\" /usr/share/nginx/html/assets/*.js; elif [ -n \"$VITE_REALTIME_URL\" ]; then sed -i \"s|http://localhost:5006|$VITE_REALTIME_URL|g\" /usr/share/nginx/html/assets/*.js; fi && nginx -g 'daemon off;'"]
