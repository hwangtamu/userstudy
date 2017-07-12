# README

Steps of converting Redis database on Heroku to local csv file.

### 0.Requirements

* Python 2.7.x
* Redis
* rdbtools (https://github.com/sripathikrishnan/redis-rdb-tools)


### 1.Sync RDB from Heroku

By default, Redis stores data in `dump.rdb`. Once the Redis-to-go plugin is installed on the Heroku project, a remote Redis instance is created. The configuration of the remote Redis instance can be accessed on the overview page of the Heroku project. An address of the Redis instance is in the format of 

(example)
```
redis://redistogo:2d183080d0db8a6a037c76f4f6c898e2@sculpin.redistogo.com:9449/
```
To sync the remote data, we have to create a `redis.conf` file

(example)
```
masterauth 2d183080d0db8a6a037c76f4f6c898e2
slaveof sculpin.redistogo.com 9449
```
Then run
```
redis-server redis.conf
```
to sync the database.

__Trouble Shooting__:
1. binding error. This error happens if you already have a redis-server running on your local machine. This error can be simply solved by shutting down the local redis service.
```
redis-cli SHUTDOWN
```
2. rdb version/format error. This error happens probably due to the version conflicts between Heroku and your local machine. This error can be simply solved by deleting your local `dump.rdb` file.

### 2. RDB to JSON
First make sure the package `rdbtools` in installed.

Run command
```
rdb -c json [path to dump.rdb] -f [path to *.json to be created]
```
to create a json file.

### 3. JSON to CSV
Use the Python script `json2csv` from command line:
```
json2csv.py [path to json] [path to csv]
```
Check if the csv file is created.





