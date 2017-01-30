#!/usr/bin/python
import sys, json
import collections

#Shift sequence.json file
def main():
    info = list()

    #Load data set to append
    try:
        with open('sequence.json') as f:
            info = json.load(f)
    except:
        print 'Could not load file.'
        sys.exit(2)

    new_sequence = collections.deque(info["sequence"])
    new_sequence.rotate(1)
    new_sequence = list(new_sequence)

    new_id = info["worker_id"]
    new_id = int(new_id, 16) + 1
    new_id = format(new_id, 'x')

    try:
        with open('sequence.json', 'w') as f:
            json.dump({"sequence": new_sequence, "worker_id": new_id}, f, indent=4, sort_keys=True)
    except IOError as e:
        print 'Could not open file.', e
        sys.exit(2)

if __name__ == "__main__":
    main()
