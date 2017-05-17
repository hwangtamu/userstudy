/* global require:true, console:true, process:true, __dirname:true */
'use strict'

var fs      = require('fs')
  , dataset = []
  , redis   = require('redis')
  , output = "/result.json"
  , client


client = redis.createClient()

client.on('connect', keys)

function keys () {
    client.keys("*", function (err, res) {
        res.forEach(data)
        client.quit()
    });
}

function data (k, i, arr) {
    client.hgetall(k, function (err, obj) {
        dataset.push(obj)
        if(i === arr.length-1) log(dataset)
    });
}

function log (obj) {
    var json = JSON.stringify(obj, null, '\t')
    console.log(json)
    fs.writeFile(output, json, 'utf8');
}

