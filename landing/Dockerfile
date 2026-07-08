FROM node:20-alpine AS build

WORKDIR /app

COPY . .
RUN node build.js

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
