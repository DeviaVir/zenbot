FROM node:8

RUN mkdir -p /app
WORKDIR /app

RUN npm install -g node-gyp
COPY package-lock.json package.json post_install.js ./
RUN npm install --unsafe
COPY . .

RUN ln -s /app/zenbot.sh /usr/local/bin/zenbot

ENV NODE_ENV production

ENTRYPOINT ["/usr/local/bin/node", "zenbot.js"]
CMD [ "trade", "--paper" ]
