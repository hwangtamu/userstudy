from helper import *

f = open('groups.csv', 'r')
reader = csv.reader(f)
d = {}
title = []
# name frequency
ff = {}
lf = {}


for i in reader:
    if i[0].isalpha():
        title = i
    if i[0].isdigit():
        if i[0] not in d:
            d[i[0]] = [i[1:]]
        else:
            d[i[0]] += [i[1:]]

        #freq
        if i[2] not in lf:
            lf[i[2]] = 1
        else:
            lf[i[2]] += 1
        if i[3] not in ff:
            ff[i[3]] = 1
        else:
            ff[i[3]] += 1

data = []
data_ = []
counter = 0
id = 1
for p in d:
    for i in range(1,len(d[p])):
        x, y = pair([d[p][0], d[p][i]])
        if x[-1]:
            x[-1] = x[-1][:2] + '/' + x[-1][3:5] + '/' + x[-1][6:]
        if y[-1]:
            y[-1] = y[-1][:2] + '/' + y[-1][3:5] + '/' + y[-1][6:]

        data+=[[id, p] + x]
        data+=[[id, p] + y]
    id+=1

id = 1

for p in d:
    if len(d[p]) == 2:
        x, y = pair([d[p][0], d[p][1]])
        if x[-1]:
            x[-1] = x[-1][:2] + '/' + x[-1][3:5] + '/' + x[-1][6:]
        if y[-1]:
            y[-1] = y[-1][:2] + '/' + y[-1][3:5] + '/' + y[-1][6:]

        data_ += [[id, p] + x]
        data_ += [[id, p] + y]
    if counter == 5:
        break
    id += 1
    counter += 1

f = open('output.csv','wb')
w = csv.writer(f)
w.writerow(['Group ID', 'Record ID', 'First Name', 'FF', 'Last Name', 'LF', 'Reg No.', 'DoB', 'First Name', 'Last Name', 'Reg No.', 'DoB'])
mapping = [0, 1, 4, 11, 3, 10, 2, 5, 8, 7, 6, 9]
for i in data:
    i+=[lf[i[3]], ff[i[4]]]
    w.writerow([i[m] for m in mapping])

f = open('output_.csv','wb')
w = csv.writer(f)
w.writerow(['Group ID', 'Record ID', 'First Name', 'FF', 'Last Name', 'LF', 'Reg No.', 'DoB', 'First Name', 'Last Name', 'Reg No.', 'DoB'])
mapping = [0, 1, 4, 11, 3, 10, 2, 5, 8, 7, 6, 9]
for i in data_:
    i+=[lf[i[3]], ff[i[4]]]
    w.writerow([i[m] for m in mapping])