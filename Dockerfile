FROM nginx:1.23.4

COPY ./nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install nodejs gcc g++ make -y -qq
RUN npm i -g pm2

WORKDIR /app

COPY dist /app
COPY server /app/server
COPY package.json /app/package.json
COPY postinstall.sh /app/postinstall.sh
COPY ecosystem.config.js /app/ecosystem.config.js

# Install server deps
RUN npm i --omit=dev
RUN npm run build:server

EXPOSE 80

RUN pm2 startup
RUN pm2 start /app/ecosystem.config.js
RUN pm2 save
# RUN pm2 stop all

