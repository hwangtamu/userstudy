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
# About
Powered by experimentr (https://github.com/codementum/experimentr), the project is aiming to provide a web-based, light-weighted user interface for interactive record linkage study.

# Change Log
Feb.14:
* Fixed bug#1.
* Implemented Section 2: Groupwise Test.
* Implemented a new end.html.

Feb.13:
* Expanded clickable area to larger rectangles.
* Added font color feature to characters with differences.
* Resized icons and re-aligned text and icons.
* Fixed bug#2.

# Bug Report
See Issues.

