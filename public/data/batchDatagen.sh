#!/bin/bash

for i in {1..10}
do
    echo stream_high_density_$i.json
    ./datagen.py -o stream_high_density_$i.json -s 5 -r 1000 -t 0.1
    echo stream_low_density_$i.json
    ./datagen.py -o stream_low_density_$i.json -s 5 -r 1000 -t 0.25
done
