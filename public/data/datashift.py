#!/usr/bin/python
import sys, json
import collections

#Shift sequence.json file
def main():
    sequence = list()

    #Load data set to append
    try:
        with open('sequence.json') as f:
            sequence = json.load(f)
    except:
        print 'Could not load file.'
        sys.exit(2)

    sequence = collections.deque(sequence["sequence"])
    sequence.rotate(1)
    sequence = list(sequence)

    try:
        with open('sequence.json', 'w') as f:
            json.dump({"sequence": sequence}, f, indent=4, sort_keys=True)
    except IOError as e:
        print 'Could not open file.', e
        sys.exit(2)

if __name__ == "__main__":
    main()
