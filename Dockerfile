FROM node:8

RUN mkdir -p /app
WORKDIR /app

COPY . /app
RUN npm install -g node-gyp
RUN npm install --unsafe

RUN ln -s /app/zenbot.sh /usr/local/bin/zenbot

ENV NODE_ENV production

ENTRYPOINT ["/usr/local/bin/node", "zenbot.js"]
CMD [ "trade", "--paper" ]
