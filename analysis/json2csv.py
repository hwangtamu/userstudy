# written by Han Wang
# 7/11/2017
import csv,json,sys

def flatten(new_key, old_key, d):
    """
    
    :param new_key: new key name
    :param old_key: key name in raw data
    :param d: data
    :return: 
    """

    for i in d:
        if old_key in d[i]:
            for j in range(len(d[i][old_key].split(','))):
                d[i][new_key+str(j+1)] = d[i][old_key].split(',')[j]

            d[i].pop(old_key)


def flatten_clicks(d):
    o = ['clicks','s2_clicks','practice_clicks','practice2_clicks']
    n = ['sec','sec2','prac','prac2']
    for i in d:
        for k in range(len(o)):
            if o[k] in d[i]:
                t = d[i][o[k]].split(',')
                for c in range(len(t)/3):
                    d[i][n[k]+'_time'+str(c+1)] = t[3*c]
                    d[i][n[k]+'_qnum'+str(c+1)] = t[3*c+1]
                    d[i][n[k]+'_res'+str(c+1)] = t[3*c+2]
                d[i].pop(o[k])


arg = sys.argv[1:]

with open(arg[0], 'r') as f:
    data = json.load(f)[0]

new_keys = ['next', 'sec_ans', 'sec2_ans', 'prac_ans', 'prac2_ans', 'grades', 'sec2_grades']
old_keys = ['switch','mat_answer', 'section2_answer', 'practice_answer', 'practice2_answer', 'grades', 's2_grades']

for i in range(len(new_keys)):
    flatten(new_keys[i],old_keys[i], data)
flatten_clicks(data)

k = data.keys()

fieldnames = set([])

for i in k:
    fieldnames = fieldnames | set(data[i].keys())
fieldnames.remove('practice')
fieldnames.remove('practice2')
fieldnames.remove('section2')
#fieldnames.remove('answer')
fieldnames = sorted(list(fieldnames))

c = open(arg[1],'wb')
writer = csv.DictWriter(c, ['postId']+fieldnames,extrasaction='ignore')

writer.writeheader()
for i in k:
    writer.writerow(data[i])

