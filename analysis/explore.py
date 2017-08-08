import json
import datetime

def time_span(l,c):
    switch = c[0][l]['switch'].split(',')
    #clicks
    click = c[0][l]['clicks']
    t_click = click.split(',')[::3]
    q_click = click.split(',')[1::3]
    a_click = click.split(',')[2::3]

    if t_click == ['']:
        return
    #practice
    click1 = c[0][l]['practice_clicks']
    t_click1 = click1.split(',')[::3]
    q_click1 = click1.split(',')[1::3]
    a_click1 = click1.split(',')[2::3]
    #practice2
    click2 = c[0][l]['practice2_clicks']
    t_click2 = click2.split(',')[::3]
    q_click2 = click2.split(',')[1::3]
    a_click2 = click2.split(',')[2::3]
    s = [datetime.datetime.fromtimestamp(float(x)/1000).strftime('%Y-%m-%d %H:%M:%S.%f')[11:23] for x in switch]
    c = [datetime.datetime.fromtimestamp(float(x)/1000).strftime('%Y-%m-%d %H:%M:%S.%f')[11:23] for x in t_click]
    c1 = [datetime.datetime.fromtimestamp(float(x)/1000).strftime('%Y-%m-%d %H:%M:%S.%f')[11:23] for x in t_click1]
    #c2 = [datetime.datetime.fromtimestamp(float(x)/1000).strftime('%Y-%m-%d %H:%M:%S.%f')[11:23] for x in t_click2]

    #print sorted(s)

    #practice
    #for i in range(len(c1)):
    #    print (c1[i], q_click1[i],a_click1[i])

    #main study
    s = sorted(s)
    switch = sorted(switch)
    res = {}
    indice = 0
    tt = 0
    try:
        for i in range(len(c)):
            while s[indice]<c[i]:
                if indice>0:
                    if int(q_click[i])/6 not in res:
                        res[int(q_click[i])/6] = int(switch[indice])-int(switch[indice-1])
                    #print 'Next Button: '+str(int(q_click[i])/6)+' '+s[indice]+', time elapse: '+str(int(switch[indice])-int(switch[indice-1]))
                indice+=1
            #print (c[i], q_click[i], a_click[i])
            #print int(q_click[i])/6
            #if i==len(c)-1:
                #print 'Next Button: '+str(int(q_click[i])/6)+' '+s[indice+1]+', time elapse: '+str(int(switch[indice])-int(switch[indice-1]))
            if int(q_click[i]) / 6 not in res:
                res[int(q_click[i]) / 6] = int(switch[indice]) - int(switch[indice - 1])
        return res
    except IndexError:
        print s
        pass

output = []
c = json.load(open('new1.json','r'))
for i in c[0].keys():
    #print "==========================================="
    print i, c[0][i]['id']
    tmp = {}
    tmp[i] = time_span(i,c)
    if time_span(i,c):
        output +=[tmp]

json.dump(output,open('pages.json','wb'))
