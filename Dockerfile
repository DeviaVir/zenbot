FROM node:latest
RUN apt update
RUN apt install -y python-pip 
RUN pip install deap
ADD . /app
WORKDIR /app

RUN npm install
RUN npm update
