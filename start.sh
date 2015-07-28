#!/bin/bash
redis-server redis.conf &
node app.js &
