FROM node:boron

ADD . /app
WORKDIR /app

RUN npm install
