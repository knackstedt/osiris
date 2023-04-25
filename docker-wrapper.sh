#!/bin/bash

# Start the API server
pm2-runtime ecosystem.config.js &

# Start nginx
nginx -g daemon off &

wait -n
exit $?
