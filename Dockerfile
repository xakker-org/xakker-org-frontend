FROM node:20-alpine AS build

WORKDIR /build

COPY .env .env.production ./
COPY app/package.json app/package-lock.json ./app/
RUN npm --prefix app ci --legacy-peer-deps

COPY app ./app
RUN npm --prefix app run build

FROM nginx:alpine

COPY --from=build /build/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
