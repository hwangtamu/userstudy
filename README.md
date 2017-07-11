Study of Record Linkage and Information Disclosure
================
# Howto
## Environment Requirements

  Node.js (>=4.5.0)

  Express (>=4.14.0)

  Redis-server (>=0.0.3)

## Start
Open a cmd or terminal window (depends on you operating system), go to the project directory.

Before starting the app, first start a local redis server:
```sh
redis-server local.conf
```
or use an online redis server:
```sh
redis-server redis.conf
```
To start this app:
```sh
node app.js
```
## Url Parameters
There are a number of parameters that you can use to control the application. In addition to the url already present, adding the following will affect the app behaviour

1. Mode of disclosure:  

> /?mode=3

This is a compulosory parameter without which the website won't work. Takes any value from 1 to 5. 

2. ID:

> /?id=123

User supplied ID will be added to the data. Handy when user needs to be linked with other data. 

3. Data for display:
By default, the data present in output.csv will be displayed in the main section. This data can be controlled by using 
> /upload

and uploading the data there. 
However, if you want one of the predefined datasets chosen at random (that also give the recap slides meaning) use
> /?sampling=true

4. Testing mode:
By default, many pages force user input. To bypass this behaviour, use
> /?testing=true

5. Skip to section:
If you want to skip directly to a section there you can use,
> /?section=7

Please note that the section numbers are absolute whatever mode the user is using. Some important sections currently are :

* 3 - RL introduction
* 4 - Practice 1
* 5 - Data Mapping for modes 3 to 5
* 6 - Practice 2
* 8 - Main Study
* 9 - Section 2
* 10 - Post Questionnaire 

# About
Powered by experimentr (https://github.com/codementum/experimentr), the project is aiming to provide a web-based, light-weighted user interface for interactive record linkage study.
