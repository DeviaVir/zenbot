FROM node:8

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
COPY webpack.config.js /app/
COPY webpack-src /app/webpack-src
COPY templates /app/templates
RUN npm install -g node-gyp
RUN npm install --unsafe-perm

COPY . /app
RUN ln -s /app/zenbot.sh /usr/local/bin/zenbot

ENV NODE_ENV production

ENTRYPOINT ["/usr/local/bin/node", "zenbot.js"]
CMD [ "trade", "--paper" ]
