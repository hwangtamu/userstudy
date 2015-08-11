#!/bin/bash
echo "Merging results/..data.json to results/merged_data.json"
cd results
for arg in `ls | grep ^processed_.._data.json`
do
    STR=$STR' '$arg
done

jq -s "add|." $STR > merged_data.json
