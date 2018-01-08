FROM node:8

RUN mkdir -p /app \
    && npm i -g npm node-gyp \
    && ln -s /app/zenbot.sh /usr/local/bin/zenbot
WORKDIR /app

COPY package.json package-lock.json webpack.config.js /app/
COPY webpack-src /app/webpack-src/
COPY templates /app/templates/
RUN npm i --unsafe-perm

ENV NODE_ENV=production
ENTRYPOINT ["/usr/local/bin/node", "zenbot.js"]
CMD [ "trade", "--paper" ]
