FROM ubuntu:22.04

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install nginx nodejs gcc g++ make -y -qq
RUN npm i -g pm2
RUN service nginx enable

WORKDIR /app

# Pull in nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

COPY dist /app
COPY server /app/server
COPY package.json /app/package.json
COPY postinstall.sh /app/postinstall.sh
COPY ecosystem.config.js /app/ecosystem.config.js

# Install server deps
RUN npm i --omit=dev
RUN npm run build:server

EXPOSE 80

CMD ["pm2-runtime", "ecosystem.config.js"]
