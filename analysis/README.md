Before testing
1. Make sure redis has been flushed by running ./flushdb
2. Make sure public/data/sequence.json is correct
	This file should contain the next participants id
	To increment participants id and shift sequence run the following in public/data folder:
	./datashift.py

After a single test
1. ./pull.sh this will pull the data into results/data.json
2. rename the file with the particpant id. For ex. using A1 as participant id
	mv results/data.json results/a1_data.json
3. once test is finished run ./flushdb this will make cleanup redis to be ready for next test
	ONLY flush once you backed up file.

After all tests
1. ./process.sh this will process each xx_data.json
2. ./merge.sh this will merge each processed file into one large file
3. ./convert.sh this will convert the marged file into csv format

Important Note
After each single tests you may want to backup each one to an external drive.



### Notes

Answers to questions.

Create output file to each page.
Think about how to capture data for each user.

Data: time spent on each page, clicks on the whole browser,