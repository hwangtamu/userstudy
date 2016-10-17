import csv
input1 = "data.csv"
output = "data_alt.csv"
data1 = []

with open(input1) as csv1:
    reader1 = csv.reader(csv1)
    tmp = []
    for row in reader1:
        tmp += [row]
    for i in xrange(len(tmp)):
        if i>0:
            tmp[i][-2] = tmp[i][-2][:2]+'/'+tmp[i][-2][3:5]+'/'+tmp[i][-2][6:]
        data1 += [tmp[i]]


with open(output,"w") as out:
    writer = csv.writer(out)
    writer.writerows(data1)
    

