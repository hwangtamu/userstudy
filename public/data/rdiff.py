#from helper import *
import csv

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

def pair(s,star_diff_index):
    """

    :param s: a pair of records 
    :return: 
    """
    tmp1 = list(s[0])
    tmp2 = list(s[1])

    for i in range(len(tmp1)):
        if i in star_diff_index:
            x, y = get_edit_distance(tmp1[i], tmp2[i])
        else:
            x,y = tmp1[i], tmp2[i]
        tmp1 += [x]
        tmp2 += [y]
    return tmp1, tmp2

def find_index(name_list, prop_name):
    for i in range(len(name_list)):
        if (name_list[i].upper() == prop_name.upper()):
            return i

def make_list_dict(file_path,id_name):
    f = open(file_path, 'r')
    reader = csv.reader(f)
    d = {}
    tmp = []
    for row in reader:
        tmp += [row]
    title = tmp[0]
    tmp = tmp[1:len(tmp)]
    n = len(title)

    index_id = find_index(title, id_name)
    index_vot_reg = find_index(title, "voter_reg_num")
    index_fname = find_index(title, "first_name")
    index_lname = find_index(title, "last_name")
    index_dob = find_index(title, "dob")
    star_calc_indexes = {"voter_reg_num":index_vot_reg-1, "last_name":index_lname-1,"first_name":index_fname-1,"dob":index_dob-1}

    data = {}
    ff = {}
    lf = {}

    for r in range(len(tmp)):
        rec = tmp[r]
        id = rec[index_id]

        if rec[index_lname] not in lf:
            lf[rec[index_lname]] = 1
        else:
            lf[rec[index_lname]] += 1
        if rec[index_fname] not in ff:
            ff[rec[index_fname]] = 1
        else:
            ff[rec[index_fname]] += 1

        del rec[index_id]
        if(id not in data.keys()):
            data[id] = [rec]
        else:
            rec = data[id].append(rec)

    return data, title, star_calc_indexes, ff,lf


def star_similarities(d, star_indices):
    data = []
    id = 1
    star_val = star_indices.values()
    for p in d:
        for i in range(1, len(d[p])):
            x, y = pair([d[p][0], d[p][i]], star_val)
            if x[star_indices["dob"]]:
                x[-1] = x[-1][:2] + '/' + x[-1][3:5] + '/' + x[-1][6:]
            if y[star_indices["dob"]]:
                y[-1] = y[-1][:2] + '/' + y[-1][3:5] + '/' + y[-1][6:]

            data += [[id, p] + x]
            data += [[id, p] + y]
        id += 1
    return data


def data_filter(data_as_list,item):
    new_data = []
    for i in range(len(data_as_list)):
        if item in data_as_list[i]:
            new_data.append(data_as_list[i])
    return(new_data)

def get_col_indices(data, star_indices, order):
    id_grp = [0,1]
    org = [star_indices[item] + 2 for item in order]
    offset = (len(data[0]) - 2) / 2
    star =  [a + offset for a in org]
    all_indices = id_grp + org + star
    return all_indices


def reorganize_cols(data, star_indices, order):
    col_indices = get_col_indices(data, star_indices, order)
    new_data = []
    for i in range(len(data)):
        rec = []
        for j in col_indices:
            rec.append(data[i][j])
        new_data.append(rec)
    return new_data

def write_data(data_list,file_name):
    f = open(file_name,'wb')
    w = csv.writer(f)
    w.writerow(['Group ID', 'Record ID', 'First Name', 'FF', 'Last Name', 'LF', 'Reg No.', 'DoB', 'First Name', 'Last Name', 'Reg No.', 'DoB'])
    #mapping = [0, 1, 4, 11, 3, 10, 2, 5, 8, 7, 6, 9]
    for i in range(len(data_list)):
        rec = data_list[i]
        rec.insert(3, ff[rec[2]])
        rec.insert(5, lf[rec[4]])
        data_list[i] = rec
        w.writerow(rec)
    f.close()


d ,title, star_indices , ff, lf = make_list_dict("groups_without_modif.csv","ID")
print d
data = star_similarities(d, star_indices)
print data
data_egen = data_filter(data, "egen")
data_twins = data_filter(data,"twins")
data_duplicates = data_filter(data,"duplicate")
data_natural = data_filter(data,"natural")

data_egen = reorganize_cols(data_egen, star_indices, ["first_name", "last_name", "voter_reg_num", "dob"])
data_twins = reorganize_cols(data_twins, star_indices, ["first_name", "last_name", "voter_reg_num", "dob"])
data_duplicates = reorganize_cols(data_duplicates, star_indices, ["first_name", "last_name", "voter_reg_num", "dob"])
data_natural = reorganize_cols(data_natural, star_indices, ["first_name", "last_name", "voter_reg_num", "dob"])

write_data(data_egen, "data_egen.csv")
write_data(data_twins, "data_twins.csv")
write_data(data_duplicates, "data_duplicates.csv")
write_data(data_natural, "data_natural.csv")









#
# f = open('output.csv','wb')
# w = csv.writer(f)
# w.writerow(['Group ID', 'Record ID', 'First Name', 'FF', 'Last Name', 'LF', 'Reg No.', 'DoB', 'First Name', 'Last Name', 'Reg No.', 'DoB'])
# mapping = [0, 1, 4, 11, 3, 10, 2, 5, 8, 7, 6, 9]
# for i in data:
#     i+=[lf[i[3]], ff[i[4]]]
#     w.writerow([i[m] for m in mapping])
#

#
# f = open('groups.csv', 'r')
# reader = csv.reader(f)
# d = {}
# title = []
# # name frequency
# ff = {}
# lf = {}
#
# for i in reader:
#     if i[0].isalpha():
#         title = i
#     if i[0].isdigit():
#         if i[0] not in d:
#             d[i[0]] = [i[1:]]
#         else:
#             d[i[0]] += [i[1:]]
#
#         #freq
#         if i[2] not in lf:
#             lf[i[2]] = 1
#         else:
#             lf[i[2]] += 1
#         if i[3] not in ff:
#             ff[i[3]] = 1
#         else:
#             ff[i[3]] += 1
#
# print lf
# print ff
# print d


# id = 1
#
# for p in d:
#     if len(d[p]) == 2:
#         x, y = pair([d[p][0], d[p][1]])
#         if x[-1]:
#             x[-1] = x[-1][:2] + '/' + x[-1][3:5] + '/' + x[-1][6:]
#         if y[-1]:
#             y[-1] = y[-1][:2] + '/' + y[-1][3:5] + '/' + y[-1][6:]
#
#         data_ += [[id, p] + x]
#         data_ += [[id, p] + y]
#     if counter == 5:
#         break
#     id += 1
#     counter += 1


# f = open('output_.csv','wb')
# w = csv.writer(f)
# w.writerow(['Group ID', 'Record ID', 'First Name', 'FF', 'Last Name', 'LF', 'Reg No.', 'DoB', 'First Name', 'Last Name', 'Reg No.', 'DoB'])
# mapping = [0, 1, 4, 11, 3, 10, 2, 5, 8, 7, 6, 9]
# for i in data_:
#     i+=[lf[i[3]], ff[i[4]]]
#     w.writerow([i[m] for m in mapping])
#
