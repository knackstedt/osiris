FROM nginx:1.23.4-alpine

COPY ./nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

RUN apk add nodejs npm --no-cache
RUN npm i -g pm2

WORKDIR /app

COPY . /app

EXPOSE 80

CMD ["sh", "docker-wrapper.sh"]
