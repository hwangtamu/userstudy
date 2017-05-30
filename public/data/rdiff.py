#from helper import *
import csv


def get_edit_distance(s1, s2):
    finalStr1 = ""
    finalStr2 = ""

    if len(s1)==0:
        return "", s2
    if len(s2)==0:
        return s1, ""

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


def damerau_levenshtein_distance(s1, s2):
    d = {}
    lenstr1 = len(s1)
    lenstr2 = len(s2)
    for i in xrange(-1, lenstr1 + 1):
        d[(i, -1)] = i + 1
    for j in xrange(-1, lenstr2 + 1):
        d[(-1, j)] = j + 1

    for i in xrange(lenstr1):
        for j in xrange(lenstr2):
            if s1[i] == s2[j]:
                cost = 0
            else:
                cost = 1
            d[(i, j)] = min(
                d[(i - 1, j)] + 1,  # deletion
                d[(i, j - 1)] + 1,  # insertion
                d[(i - 1, j - 1)] + cost,  # substitution
            )
            if i and j and s1[i] == s2[j - 1] and s1[i - 1] == s2[j]:
                d[(i, j)] = min(d[(i, j)], d[i - 2, j - 2] + cost)  # transposition

    return d[lenstr1 - 1, lenstr2 - 1]


def check_starring(s1, s2):
    len_1 = len(s1)
    len_2 = len(s2)
    if(len_1 >= len_2):
        if s1[:len_2] == s2:
            return True
        elif s1[len(s1)-len(s2):] == s2:
            return True
        b_len = len_1
    else:
        if s2[:len_1] == s1:
            return True
        elif s2[len(s2)-len(s1):] == s1:
            return True
        b_len = len_2
    edit_distance = damerau_levenshtein_distance(s1, s2)
    # if s1 in ["BOSSARD","MCCLUSKEY"]:
    #     print s1, s2, edit_distance, edit_distance/b_len
    if float(edit_distance)/b_len > 0.5:
        return False
    return True


def get_star_date(date_1, date_2):
    #print date_1, date_2
    if (len(date_1) < 10) & (len(date_2) < 10):
        return "", ""
    if len(date_1) < 10:
        return "", date_2[:2] + date_2[3:5] + date_2[6:]
    if len(date_2) < 10:
        return date_1[:2] + date_1[3:5] + date_1[6:], ""
    final_1 = ""
    final_2 = ""
    ind = [0,1,3,4,6,7,8,9]

    for i in ind:
        if date_1[i] == date_2[i]:
            final_1 = final_1 + "*"
            final_2 = final_2 + "*"
        else:
            final_1 = final_1 + date_1[i]
            final_2 = final_2 + date_2[i]
    return final_1,final_2


def pair(s,star_indices):
    """

    :param s: a pair of records 
    :return: 
    """
    tmp1 = list(s[0])
    tmp2 = list(s[1])
    star_index_values = star_indices.values()
    for i in range(len(tmp1)):
        if i in star_index_values:
            if i == star_indices["dob"]:
                x, y = get_star_date(tmp1[i], tmp2[i])
            else:
                if check_starring(tmp1[i], tmp2[i]):
                    x, y = get_edit_distance(tmp1[i], tmp2[i])
                else:
                    x, y = tmp1[i], tmp2[i]
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
    index_file_id = find_index(title,"file_id") -1
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

    return data, title, star_calc_indexes, ff,lf, index_file_id


def star_similarities(d, star_indices,index_file_id):
    data = []
    id = 1
    #star_val = star_indices.values()
    for p in d:
        for i in range(1, len(d[p])):
            file_id_1 = d[p][0][index_file_id]
            file_id_2 = d[p][i][index_file_id]
            if not file_id_1 == file_id_2:
                x, y = pair([d[p][0], d[p][i]], star_indices)
                if not len(x[14]) < 8:
                    x[14] = x[14][:2] + '/' + x[14][2:4] + '/' + x[14][4:]
                if not len(y[14]) < 8:
                    y[14] = y[14][:2] + '/' + y[14][2:4] + '/' + y[14][4:]

                data += [[id, file_id_1] + x]
                data += [[id, file_id_2] + y]
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


d ,title, star_indices , ff, lf, index_file_id = make_list_dict("groups_without_modif.csv","ID")

data = star_similarities(d, star_indices,index_file_id)

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


