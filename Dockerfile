FROM node:latest

ADD . /app
WORKDIR /app

RUN npm install
ENV NODE_ENV "docker"

EXPOSE 3013