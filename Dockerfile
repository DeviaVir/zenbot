FROM node:latest

ADD . /app
WORKDIR /app

RUN npm install

EXPOSE 3013