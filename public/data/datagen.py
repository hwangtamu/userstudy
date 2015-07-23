#!/usr/bin/python

from datetime import datetime
import sys, getopt, json, random, math

#Define function that generates data.value
def valueFunction(*args):
	#return math.fabs(math.sin(args[0])) * 100
	return random.randrange(0, 50)

#Define function that generates data.flag
def flagFunction(*args):
	flag = "point"
	if (args[0] + 1 == args[1]):
		flag = "primary point"
	if (args[0] + 1 % args[2] == 0):
		flag = "secondary point"
	return flag

def createSet(repeat, timeoffset):
	subset = list()
	i = 0
	j = 0

	window_size = 20000
	interval_size = 1000

	dots_per_window = (window_size/timeoffset/interval_size)
	print 'Dots per window of time', dots_per_window

	r2 = random.randrange(5, 16) #Approximate number of secondary goal per window
	_r2 = r2
	print 'Number of secondary goals', r2
	r2 = math.floor(dots_per_window / r2)

	r1 = random.randrange(math.floor(dots_per_window / 3), math.floor(dots_per_window * 2 / 3)) #Primary Goal

	#Fix any possible collisions
	while r1 % _r2 == 0:
		r1 = random.randrange(math.floor(dots_per_window / 3), math.floor(dots_per_window * 2 / 3)) #Primary Goal

	print 'First primary goal at', r1, '\n'

	if r1 == r2:
		r1 += 1

	while i < repeat:
		datum = {'id': i, 'timeoffset': round(j, 3), 'value': valueFunction(j), 'flag': flagFunction(i, r1, r2) }
		subset.append(datum)
		i += 1
		j += timeoffset
	return subset


#Create json data file
def main(argv):
	outputfile = ''
	repeat = 0
	sets = 0
	timeoffset = 1
	append = False

	#Get command line args
	try:
		opts, args = getopt.getopt(argv,"ho:s:r:t:a",["outfile=","sets=","repeat=","timeoffset=","append="])
	except getopt.GetoptError:
		print 'datagen.py -o <outputfile> -s <sets> -r <repeat> -t <timeoffset> -a <append>'
		sys.exit(2)
	for opt, arg in opts:
		if opt == '-h':
			print 'datagen.py -o <outputfile> -s <sets> -r <repeat> -t <timeoffset> -a <append>'
			sys.exit()
		elif opt in ("-o", "--outfile"):
			outputfile = arg
		elif opt in ("-s", "--sets"):
			sets = int(arg)
		elif opt in ("-r", "--repeat"):
			repeat = int(arg)
		elif opt in ("-t", "--timeoffset"):
			timeoffset = float(arg)
		elif opt in ("-a", "--append"):
			append = True

	dataset = list()

	#Load data set to append
	if append == True:
		try:
			with open(outputfile) as f:
			    dataset = json.load(f)
		except:
			print 'datagen.py -o <outputfile> -s <sets> -r <repeat> -t <timeoffset> -a <append>'
			print 'cant load file'
			sys.exit(2)

	#Create data
	i = 0
	while i < sets:
		dataset.append(createSet(repeat, timeoffset))
		i += 1

	try:
		with open(outputfile, 'w') as outfile:
		    json.dump(dataset, outfile, indent=4, sort_keys=True)
	except:
		print 'datagen.py -o <outputfile> -s <sets> -r <repeat> -t <timeoffset> -a <append>'
		sys.exit(2)

if __name__ == "__main__":
   main(sys.argv[1:])
