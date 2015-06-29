#!/usr/bin/python

from datetime import datetime
import sys, getopt, json, random, math

#Define function to generate data by
def function(*args):
	return math.fabs(math.cos(args[0]))

#Create json data file
def main(argv):
	outputfile = ''
	repeat = 0
	timeoffset = 1
	try:
		opts, args = getopt.getopt(argv,"ho:r:t",["ofile=","repeat_count=","timeoffset="])
	except getopt.GetoptError:
		print 'datagen.py -o <outputfile> -r <repeat_count> -t <timeoffset>'
		sys.exit(2)
	for opt, arg in opts:
		if opt == '-h':
			print 'datagen.py -o <outputfile> -r <repeat_count> -t <timeoffset>'
			sys.exit()
		elif opt in ("-o", "--ofile"):
			outputfile = arg
		elif opt in ("-r", "--repeat_count"):
			repeat = int(arg)
		elif opt in ("-t", "--timeoffset"):
			timeoffset = float(arg)
	data = list()

	i = 0
	j = 0
	while i < repeat:
		datum = {'id': i, 'timeoffset': round(j, 2), 'val': function(j) * 100}
		data.append(datum)
		i += 1
		j += timeoffset

	with open(outputfile, 'w') as outfile:
	    json.dump(data, outfile, indent=4, sort_keys=True)

if __name__ == "__main__":
   main(sys.argv[1:])

