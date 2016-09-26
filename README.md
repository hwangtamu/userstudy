Streaming Selection Vis
================

This is based on [experimentr](https://github.com/codementum/experimentr), a hosting/data-collection backend and module-based frontend for web-based visualization studies.

## Installation

* Install [nodejs](http://nodejs.org/download/)
* Install [redis](http://redis.io/download)
* Install [python 2.7](https://www.python.org/download/releases/2.7)
* Install node modules:  `npm install`

## Usage

Start redis:

    redis-server redis.conf

Run the server:

    node app.js

Then access the page at [localhost:8000](http://localhost:8000).

## Task List
* get ruby code to link two datasets
*

## Analysis

Read README.md in analysis and public/data for further usage.

## Subject Testing
Before Study
0. Consult analysis/readme.md and public/data/readme.md
1. Rotate sequence/worker_id via datashift.py
2. Backup data
3. Flush redis via flushdb.sh
4. Ensure mouse settings on desktop are correct
5. Ensure window is in fullscreen mode
6. Ensure Seat/Monitor are correctly placed
7. Determine when the 2 breaks will happen (After 1st major sequence and after 2nd major sequence;
	only non-major sequence is 'none' as it is the shortest). Each break should be between 2-5 minutes.

Consent Page
1. Introduce self
2. Ask them to read over consent page
3. Give gist of what consent form is about/for
	Studying effectivness of novel selection techniques
	Last about an hour
	No PII being collected
	Mandatory 2 breaks due to sickness, eyestrain, headache, etc
	If feeling sick notify (me)
4. Tell them that if they agree we can continue and that they will be asked out to fill out a short background questionnaire

Background Questionnaire Page
Tell them that once they have form filled out that they can hit next, and that instructions will be explained for them on the next page.

Instructions Page
1. Ensure they understand the instructions.
2. Tell them they will understand this more once they get to practice.
3. Make sure they understand ' how many blue dots you saw on the screen right before time was up' part. 
	This basically means how many blues dots were on the last frame of the visualization, not the number of blue dots
	over the lifetime of the visualization.
4. Instruct them to click "I'm Ready" once they are ready.

Trials
1. After each real trial set you will see a screen like this to practice.
2. Easiest way to explain this is for you to hit practice.
3. Tell them how the technique works and that 'shift' will pause the targets in region and that 'c' will unpause those targets
4. Best to go ahead and be in good positon to hit shift and c
5. Instruct to pause red dot once it is in the highlighted freeze region; then to click said dot once it is paused
6. You can't click an un-paused red dot.
7. Then tell them to hit 'c' to clear the paused targets.
8. Instruct them to click as many red dots as possible.
9. Instruct them to also keep track of blue dots, but to not worry about it too much (preffered using visual memory if they have it).
10. First practice is always 1 minute.
11. Rest of trials will be 5-10 seconds. Must practice to continue.
12. Once you/they feel they are ready. Tell them to click 'Done Training'.

Post Survey
1. Tell them to fill out form until they get to question E and then you will takeover.
2. Probe them on each of these questions, typing what they say.
3. Once finished thank them and tell them they can leave.

After Testing
1. Consult analysis/readme.md and public/data/readme.md

# userstudy
