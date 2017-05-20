FROM node:latest

ADD . /app
WORKDIR /app

RUN npm install
