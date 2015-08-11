#!/bin/bash
echo "Converting results/..data.json to results/processed_.._data.json"
for arg in `ls results/ | grep ^.._data.json`
do
    ./src/process.py -i results/$arg -o results/processed_$arg
done
