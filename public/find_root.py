import csv
input1 = "inp1.csv"
input2 = "inp2.csv"
output = "data_.csv"
data1 = []
data2 = []
data3 = []

with open(input1) as csv1:
    reader1 = csv.reader(csv1)
    tmp = []
    for row in reader1:
        tmp += [row]
    for i in xrange(len(tmp)):
        data1 += [tmp[i]+["1-"+str(i)]]

with open(input2) as csv2:
    reader2 = csv.reader(csv2)
    tmp = []
    for row in reader2:
        tmp += [row]
    for i in xrange(len(tmp)):
        data2 += [tmp[i]+["2-"+str(i)]]
        
data = data1+data2

with open(output) as csv3:
    reader3 = csv.reader(csv3)
    for row in reader3:
        data3 += [row]

def match(row1, row2):
    if row1[1:7]==row2[1:7]:
        return True
    return False

for i in xrange(len(data3)):
    for d in data:
        if match(data3[i],d):
            data3[i] = data3[i][:8]+[d[-1]]


with open(output,"w") as out:
    writer = csv.writer(out)
    writer.writerows(data3)
    

