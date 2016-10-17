import csv
input1 = "Uncertain.csv"
input2 = "data_.csv"
output = "data.csv"
inp1 = "inp1.csv"
inp2 = "inp2.csv"

data0 = []
data1 = []
data2 = []
data3 = []


with open(inp1) as csv01:
    reader01 = csv.reader(csv01)
    tmp = []
    for row in reader01:
        tmp += [row]
    for i in xrange(len(tmp)):
        data0 += [tmp[i]+["1-"+str(i)]]
    
with open(inp2) as csv02:
    reader02 = csv.reader(csv02)
    tmp = []
    for row in reader02:
        tmp += [row]
    for i in xrange(len(tmp)):
        data0 += [tmp[i]+["2-"+str(i)]]
        
with open(input1) as csv1:
    reader1 = csv.reader(csv1)
    tmp = []
    for row in reader1:
        tmp += [row]
    for i in xrange(len(tmp)):
        data1 += [tmp[i]]

        
with open(input2) as csv2:
    reader2 = csv.reader(csv2)
    tmp = []
    for row in reader2:
        data3 += [row]

def match(row1, row2):
    if row1[:6]==row2[1:7]:
        return True
    return False

for i in xrange(len(data1)):
    for d in data0:
        if match(data1[i],d):
            data1[i] = data1[i][0:6]+[d[-1]]+[x.split(':')[0] for x in data1[i][7:]]
            
with open(output,"w") as out:
    writer = csv.writer(out)
    writer.writerows(data1)


    
