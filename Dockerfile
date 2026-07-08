FROM node:20-alpine AS build

WORKDIR /build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY .env .env.production ./
COPY app/package.json app/package-lock.json ./app/
RUN npm --prefix app ci --legacy-peer-deps

COPY app ./app
RUN npm --prefix app run build

FROM nginx:alpine

COPY --from=build /build/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
