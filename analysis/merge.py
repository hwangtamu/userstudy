import csv

f1 = 'session1/new1.csv'
f2 = 'session1/ustudy1-1.csv'
f3 = 'session1/ustudy1-g-1.csv'

reader1 = csv.DictReader(open(f1,'r'))
reader2 = csv.DictReader(open(f2,'r'))
reader3 = csv.DictReader(open(f3,'r'))

d1,d2,d3 = [],[],[]
for i in reader1:
    d1+=[i]

for i in reader2:
    d2+=[i]

for i in reader3:
    d3+=[i]

print len(d1[0]), len(d2[0]), len(d3[0])
