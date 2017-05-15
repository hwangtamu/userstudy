import csv

# name frequency
ff_1 = {}
lf_1 = {}
ff_2 = {}
lf_2 = {}

def find_duplicates(elements):
    encountered = {}
    arr = []
    for e in elements:
        if e in encountered:
            arr += [e]
        else:
            encountered[e] = 1
    #if arr:
    #    print arr
    return arr


def automatic_linkage(file_paths):
    f1 = open(file_paths[0], 'r')
    f2 = open(file_paths[1], 'r')
    reader1 = csv.reader(f1)
    reader2 = csv.reader(f2)
    header = []
    data1 = []
    data2 = []

    matched = []
    unmatched = []
    uncertain = []
    graph = {}

    # load data
    for i in reader1:
        if i[0].isalpha():
            header = i[:-1]+['MM','DD','YYYY']
        else:
            i[0] = '1-'+i[0]
            if i[-1].count('-')==2:
                data1 += [tuple(i[:-1]+i[-1].split('-'))]
            else:
                data1 += [tuple(i[:-1]+['','',''])]

            if i[2] not in lf_1:
                lf_1[i[2]] = 1
            else:
                lf_1[i[2]] += 1
            if i[3] not in ff_1:
                ff_1[i[3]] = 1
            else:
                ff_1[i[3]] += 1

    for i in reader2:
        if not i[0].isalpha():
            i[0] = '2-'+i[0]
            if i[-1].count('-')==2:
                data2 += [tuple(i[:-1]+i[-1].split('-'))]
            else:
                data2 += [tuple(i[:-1]+['','',''])]

            if i[2] not in lf_2:
                lf_2[i[2]] = 1
            else:
                lf_2[i[2]] += 1
            if i[3] not in ff_2:
                ff_2[i[3]] = 1
            else:
                ff_2[i[3]] += 1

    # blocking
    block_var1 = 'voter_reg_num'
    block_var2 = 'last_name'

    block_index1 = header.index(block_var1)
    block_index2 = header.index(block_var2)

    block_hash1 = {}
    block_hash2 = {}

    for d in data1+data2:
        if d[block_index1]:
            if d[block_index1] not in block_hash1:
                block_hash1[d[block_index1]] = [d]
            else:
                block_hash1[d[block_index1]] += [d]

    for d in data1+data2:
        if d[block_index2]:
            if d[block_index2] not in block_hash2:
                block_hash2[d[block_index2]] = [d]
            else:
                block_hash2[d[block_index2]] += [d]

    #remove duplicates
    for i in block_hash1.keys():
        if len(block_hash1[i])==1:
            unmatched += [block_hash1[i]]
        else:
            dup = find_duplicates(block_hash1[i])
            for d in dup:
                block_hash1[i].remove(d)
            for m in range(len(block_hash1[i])):
                for n in range(m, len(block_hash1[i])):
                    flag = 0
                    #print block_hash1[i][m]
                    #print block_hash1[i][n]
                    if block_hash1[i][m][1:]!=block_hash1[i][n][1:]:
                        flag=1

                    if flag == 0:
                        matched += [block_hash1[i][m]]
                    else:
                        uncertain += [block_hash1[i][m]]
                        uncertain += [block_hash1[i][n]]

                        if block_hash1[i][m] not in graph:
                            graph[block_hash1[i][m]] = [block_hash1[i][n]]
                        else:
                            graph[block_hash1[i][m]] += [block_hash1[i][n]]

                        if block_hash1[i][n] not in graph:
                            graph[block_hash1[i][n]] = [block_hash1[i][m]]
                        else:
                            graph[block_hash1[i][n]] += [block_hash1[i][m]]

    for i in block_hash2:
        if len(block_hash2[i])==1:
            unmatched += [block_hash2[i]]
        else:
            dup = find_duplicates(block_hash2[i])
            for d in dup:
                block_hash2[i].remove(d)
            for m in range(len(block_hash2[i])):
                for n in range(m, len(block_hash2[i])):
                    flag = 0
                    #print block_hash1[i][m]
                    #print block_hash1[i][n]
                    if block_hash2[i][m]!=block_hash2[i][n]:
                        flag=1

                    if flag == 0:
                        matched += [block_hash2[i][m]]
                    else:
                        uncertain += [block_hash2[i][m]]
                        uncertain += [block_hash2[i][n]]

                        if block_hash2[i][m] not in graph:
                            graph[block_hash2[i][m]] = [block_hash2[i][n]]
                        else:
                            graph[block_hash2[i][m]] += [block_hash2[i][n]]

                        if block_hash2[i][n] not in graph:
                            graph[block_hash2[i][n]] = [block_hash2[i][m]]
                        else:
                            graph[block_hash2[i][n]] += [block_hash2[i][m]]
    # DFS
    def DFS(node, label, color, cluster, graph):
        color[node] = 'G'
        if label not in cluster:
            cluster[label] = [node]
        else:
            cluster[label] += [node]
        for n in graph[node]:
            if color[n]=='W':
                DFS(n, label, color, cluster, graph)
        color[node] = 'B'

    cluster = {}
    color = {}
    for k in graph:
        color[k] = 'W'

    label = 0
    for k in graph:
        if color[k] == 'W':
            label+=1
            DFS(k, label, color, cluster, graph)

    return cluster


def get_edit_distance(s1, s2):
    finalStr1 = ""
    finalStr2 = ""

    if len(s1)*len(s2)==0:
        return "Miss", ""

    len1 = len(s1)
    len2 = len(s2)

    dp = {}
    direction = {}
    for i in range(len1+1):
        dp[i] = {}
        direction[i] = {}
        for j in range(len2+1):
            dp[i][j] = []
            direction[i][j] = []
    for i in range(len1+1):
        for j in range(len2+1):
            if i == 0:
                dp[i][j] = j
                direction[i][j] = 'd'
            elif j == 0:
                dp[i][j] = i
                direction[i][j] = 'i'
            elif s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
                direction[i][j] = 'n'
            else:
                insertVal = dp[i - 1][j]
                deleteVal = dp[i][j - 1]
                subsVal = dp[i - 1][j - 1]

                transVal = 1000000000
                if i > 1 and j > 1 and s1[i - 1] == s2[j - 2] and s1[i - 2] == s2[j - 1]:
                    transVal = dp[i - 2][j - 2]


                minAll = min([insertVal, deleteVal, subsVal, transVal])

                if minAll == transVal:
                    direction[i][j] = 't'
                elif minAll == insertVal:
                    direction[i][j] = 'i'
                elif minAll == deleteVal:
                    direction[i][j] = 'd'
                else:
                    direction[i][j] = 's'

                dp[i][j] = minAll + 1

    stI = len1
    stJ = len2
    while stI > 0 or stJ > 0:
        if direction[stI][stJ] == 'i':
            finalStr1 = s1[stI - 1] + finalStr1
            finalStr2 = " " + finalStr2
            stI = stI - 1

        elif direction[stI][stJ] == 'd':
            finalStr1 = " " + finalStr1
            finalStr2 = s2[stJ - 1] + finalStr2
            stJ = stJ - 1

        elif direction[stI][stJ] == 's':
            finalStr1 = s1[stI - 1] + finalStr1
            finalStr2 = s2[stJ - 1] + finalStr2
            stI = stI - 1
            stJ = stJ - 1

        elif direction[stI][stJ] == 'n':
            finalStr1 = "*" + finalStr1
            finalStr2 = "*" + finalStr2
            stI = stI - 1
            stJ = stJ - 1

        else:
            finalStr1 = "TX" + finalStr1
            finalStr2 = "TX" + finalStr2
            stI = stI - 2
            stJ = stJ - 2

    return finalStr1, finalStr2


def contain(h, s):
    for k in h:
        if set(k)<set(s):
            return True
    return False


def apriori_algorithm(totaldb, threshold):
    ans = {}
    threshold = int(threshold)

    h = {}

    for k in totaldb:
        for col in range(len(k)):
            if k[col]:
                if k[col] not in h:
                    h[k[col]] = 1
                else:
                    h[k[col]] += 1
    cnt = 0

    while len(h)>0:
        new_h = {}

        for k in h:
            if h[k] < threshold:
                ans[k] = h[k]

        for k in h:
            if h[k]>=threshold:
                for t in totaldb:
                    values = set(t)
                    if set(k)<values:
                        for v in values:
                            if v and (v not in k):
                                temp_set = k
                                temp_set.add(v)
                                if not contain(ans, temp_set):
                                    if tuple(temp_set) not in new_h:
                                        new_h[tuple(temp_set)]=1
                                    else:
                                        new_h[tuple(temp_set)]+=1
        for k in new_h:
            new_h[k] /= cnt
        h = new_h
        cnt+=1
    return ans

def pair(s):
    """
    
    :param s: a cluster of records 
    :return: 
    """
    tmp1 = list(s[0])
    tmp2 = list(s[1])
    for i in range(len(tmp1)):
        x,y = get_edit_distance(tmp1[i], tmp2[i])
        tmp1+=[x]
        tmp2+=[y]
    return tmp1, tmp2

'''
c = automatic_linkage(['medium/e.csv','medium/o.csv'])
d = []

for k in c:
    if len(c[k])==2:
        if c[k][0][1:]!=c[k][1][1:]:
            x,y = pair(c[k])
            d+=[[k]+x]
            d+=[[k]+y]

    elif len(c[k])<=10:
        for i in range(1,len(c[k])):
            if c[k][0][1:]!=c[k][i][1:]:
                x, y = pair([c[k][0], c[k][i]])
                d += [[k] + x]
                d += [[k] + y]


f = open('output.csv','wb')
w = csv.writer(f)
w.writerow(['Group ID', 'Record ID', 'First Name', 'FF', 'Last Name', 'LF', 'Reg No.', 'DoB', 'First Name', 'Last Name', 'Reg No.', 'DoB'])
mapping = [0, 1, 4, 11, 3, 10, 2, 5, 8, 7, 6, 9]
for i in d:
    tmp = i[:5]+['/'.join(i[5:8])]+i[8:11]+['/'.join(i[11:])]
    if tmp[1][0]=='1':
        tmp+=[lf_1[i[3]], ff_1[i[4]]]
    if tmp[1][0]=='2':
        tmp+=[lf_2[i[3]], ff_2[i[4]]]
    w.writerow([tmp[m] for m in mapping])
'''