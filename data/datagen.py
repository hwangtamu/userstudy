#!/usr/bin/python

from datetime import datetime
import sys, getopt, json, random, math

#Define return for function that generates data.value
def valueFunction(*args):
	#return math.fabs(math.sin(args[0])) * 100
	return random.randrange(0, 50)

#Define return for function that generates data.flag
def flagFunction(*args):
	flag = "point"
	if (args[0] == 160):
		flag = "primary point"
	if (args[0] % 30 == 0):
		flag = "secondary point"
	return flag


#Create json data file
def main(argv):
	outputfile = ''
	repeat = 0
	timeoffset = 1
	try:
		opts, args = getopt.getopt(argv,"ho:r:t:",["outfile=","repeat=","timeoffset="])
	except getopt.GetoptError:
		print 'datagen.py -o <outputfile> -r <repeat> -t <timeoffset>'
		sys.exit(2)
	for opt, arg in opts:
		if opt == '-h':
			print 'datagen.py -o <outputfile> -r <repeat> -t <timeoffset>'
			sys.exit()
		elif opt in ("-o", "--outfile"):
			outputfile = arg
		elif opt in ("-r", "--repeat"):
			repeat = int(arg)
		elif opt in ("-t", "--timeoffset"):
			timeoffset = float(arg)
	data = list()

	i = 0
	j = 0
	while i < repeat:
		datum = {'id': i, 'timeoffset': round(j, 3), 'value': valueFunction(j), 'flag': flagFunction(i) }
		data.append(datum)
		i += 1
		j += timeoffset

	try:
		with open(outputfile, 'w') as outfile:
		    json.dump(data, outfile, indent=4, sort_keys=True)
	except:
		print 'datagen.py -o <outputfile> -r <repeat> -t <timeoffset>'
		sys.exit(2)

if __name__ == "__main__":
   main(sys.argv[1:])
