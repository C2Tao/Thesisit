import json
import urllib
from collections import Counter
from pprint import pprint
import tsne
import plsa
import numpy as np
import sys
import copy
#import pylab
import math



kimpath = "http://www.kimonolabs.com/api/8fxfaiu6?apikey=fb110eb5d4c1775fbf3e9840e88f4f3a"
#kimpath = "http://www.kimonolabs.com/api/9d6lg708?apikey=5243944dc6c0c5602dd3f6f0ef19f2cf"
#kimpath = "http://www.kimonolabs.com/api/csy9c4ho?apikey=5243944dc6c0c5602dd3f6f0ef19f2cf"

query = sys.argv[1:]

standard = " ".join(query)
#print query
query = "%20".join(query)
query = query.replace(' ','%20')
print query
param = "&query={}&querydisp={}".format(query,query)

print query,param
print kimpath+param
webapi =  json.load(urllib.urlopen(kimpath+param))

#pprint(webapi["results"]["papers"][0]["title"]["text"])
#pprint(webapi["results"]["papers"][0]["keywordsAndAbstract"])

weblab = []

total_freq = Counter()
word_freq = {}

nD = len(webapi['results']['papers'])

for i  in range(nD):
    webitem = webapi['results']['papers'][i]
    weblab += webapi['results']['papers'][i]['title']['text'],
    webtext = webapi['results']['papers'][i]['keywordsAndAbstract'].split()
    #print webtext
    word_freq[i] = Counter(webtext)
    total_freq.update(webtext)


#print word_freq[1]
#print total_freq
#print weblab
nW = len(total_freq)

wordID = {}
IDword = {}
for j in range(nW):
    wordID[total_freq.keys()[j]] = j
    IDword[j] = total_freq.keys()[j]


Ndw = np.zeros((nD,nW))
for  i in range(nD):
    for word in word_freq[i]:
        Ndw[i][wordID[word]] = word_freq[i][word]


tf = np.sum(Ndw,0) 
idf = np.sum(np.array(Ndw > 0,dtype=int),0)

Mdw = np.zeros(np.shape(Ndw))
for d in range(len(Ndw)):
    tfidf = Ndw[d]/idf
    compl = 0
    for w in range(len(Ndw[d])):
        if tfidf[w] >=1 and compl<6:
        #if tfidf[w] >=1:
            Mdw[d][w] = tfidf[w]
            compl+=1
print sum(Mdw[0])
print sorted(Mdw[0])
#print int(Ndw >= 1)



#pprint(total_freq)
#print Ndw


nZ  = 2

noise = +np.random.rand(nD,nW)
Pd_z, Pw_z,Pz_d,Pz_w  = plsa.plsa(Ndw+noise,nZ,100)

Y = np.concatenate((Pz_d.T,Pz_w.T))

Y = Y*10

#Y = Y[:,:1]*10
#for i in range(len(Y)):
#    Y[i] = Y[i][:2]

#Y = Y[:2]
#print np.shape(Y)

#Y = tsne.tsne(Ndw.T,2,nD)




#Y = tsne.tsne(Y,2,nZ)

#Y = tsne.pca(Ndw.T,nD);
#Y = tsne.pca(Pw_z.T,nZ);

print np.shape(Y)
#print Y



#fig = pylab.figure()
#ax = fig.add_subplot(111)


#print weblab
#pylab.scatter(Y[nD:nD+nW,0], Y[nD:nD+nW,1], 20,color='blue');
#pylab.scatter(Y[0:nD,0]    , Y[0:nD,1]    , 20,color='red');

labels  = wordID.keys()

#pylab.show()


dict_doc = {}
center_doc = {}

distance = 'distance'
children = 'children'
node_type = 'type'
node_name = 'name'
doc_type = 2
word_type = 1

center_doc[node_name] = standard
center_doc['x'] = 0
center_doc['y'] = 0
center_doc[node_type] = doc_type
center_doc[children] = []




for i in range(4):
    key_doc = webapi['results']['papers'][i]['title']['text']
    doc_data = {}
    doc_data['x'] = Y[i,0]
    doc_data['y'] = Y[i,1]
    doc_data['node_href'] = webapi['results']['papers'][i]['title']['href'] 
    doc_data[node_name] = key_doc
    doc_data[node_type] = doc_type
    doc_data[children] = []
    xDiff = center_doc['x']-Y[i,0]
    yDiff = center_doc['y']-Y[i,1]
    doc_data[distance] = math.sqrt(xDiff*xDiff + yDiff*yDiff)


    kw_unsorted = []
    kw_value = []

    for j in range(nW):
        if Mdw[i][j] != 0 :
            keyword_data = {}
            keyword_data['x'] = Y[j+nD,0]
            keyword_data['y'] = Y[j+nD,1]
            xDiff = Y[i,0] - Y[j+nD,0]
            yDiff = Y[i,1] - Y[j+nD,1]
            keyword_data[distance] = math.sqrt(xDiff*xDiff + yDiff*yDiff)+5
            keyword_data[node_name] = IDword[j]
            keyword_data[node_type] = word_type
            
            doc_data[children].append(keyword_data)
            '''
            kw_unsorted += copy.deepcopy(keyword_data),
            kw_value += keyword_data[distance],
            kw_index = [zz[0] for zz in sorted(enumerate(kw_value), key=lambda x:x[1])]

            for k in kw_index:
                if k>5:break
                doc_data[children].append(kw_unsorted[k])
            '''
    center_doc[children].append(doc_data)

with open('json_all.txt', 'wb') as outfile:
    json.dump(center_doc, outfile,ensure_ascii=False)

print center_doc 
