FROM node:20-alpine AS build

WORKDIR /app
ARG PLATFORM_URL
ENV PLATFORM_URL=$PLATFORM_URL

COPY . .
RUN node build.js

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
