Streaming Selection Vis
================

This is based on [experimentr](https://github.com/codementum/experimentr), a hosting/data-collection backend and module-based frontend for web-based visualization studies.

## Installation

* Install [nodejs](http://nodejs.org/download/)
* Install [redis](http://redis.io/download)
* Install node modules:  `npm install`

## Usage

Start redis:

    redis-server redis.conf

Run the server:

    node app.js

Then access the page at [localhost:8000](http://localhost:8000).

## Analysis

Helper scripts are in the `analysis` directory.

* To get results data from server, use `pull.sh`
* To convert results to csv, use `convert.sh`
* To flush redis database, use `flushdb.sh`
