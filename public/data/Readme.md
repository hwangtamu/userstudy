# Readme

## Overview

`helper.py` and `rdiff.py` are two Python scripts for generating appropriate input data to the user study.

As for now they only work for the data generated from ncvoter datasets, with records in the format

```
['grpid', 'voter_reg_num', 'last_name', 'first_name', 'dob']
```

## helper.py

`helper.py` used to be the script for generating data from two different files, in which pairs and groups are formed automaticlly.

As for now, it serves as a library of functions for `rdiff.py`. All non-functional codes have been commented out.

## rdiff.py

`rdiff.py` is a script which takes `groups.csv` as input, and generates data ready for the use of user study.

By default, it takes `groups.csv` as input file, and no extra parameters are needed.

In case the scripts are being run on HPRC, include the following command:
```
module load Python/2.7.10-goolf-1.7.20
```

To run it:
```
$python rdiff.py
```


