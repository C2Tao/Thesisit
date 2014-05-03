import json
import urllib
from collections import Counter
from pprint import pprint
import tsne
import plsa
import numpy as np
#import pylab


webapi =  json.load(urllib.urlopen("http://www.kimonolabs.com/api/9d6lg708?apikey=5243944dc6c0c5602dd3f6f0ef19f2cf"))
#webapi = json.load(urllib.urlopen("http://www.kimonolabs.com/api/2xy9q3ui?apikey=5243944dc6c0c5602dd3f6f0ef19f2cf"))
weblab = []

total_freq = Counter()
word_freq = {}

nD = len(webapi['results']['collection1'])


for i  in range(nD):
    webitem = webapi['results']['collection1'][i]
    weblab += webitem['property1']['text'],
    webtext = webitem['property2'].split()
    print webtext
    word_freq[i] = Counter(webtext)
    total_freq.update(webtext)
#print word_freq[1]
#print total_freq
print weblab
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
pprint(total_freq)
print Ndw





nZ  = 3

noise = +np.random.rand(nD,nW)
Pd_z, Pw_z,Pz_d,Pz_w  = plsa.plsa(Ndw+noise,nZ,100)
'''
Y = Pz_w.T
print np.shape(Y)
print Y
'''
Y = np.concatenate((Pz_d.T,Pz_w.T))
print np.shape(Y)

#Y = tsne.tsne(Ndw.T,2,nD)
Y = tsne.tsne(Y,2,nZ)
#Y = tsne.pca(Ndw.T,nD);
#Y = tsne.pca(Pw_z.T,nZ);
print np.shape(Y)
print Y



#fig = pylab.figure()
#ax = fig.add_subplot(111)


print weblab
#pylab.scatter(Y[nD:nD+nW,0], Y[nD:nD+nW,1], 20,color='blue');
#pylab.scatter(Y[0:nD,0]    , Y[0:nD,1]    , 20,color='red');

labels  = wordID.keys()

#pylab.show()


#json.dumps(wordID,ensure_ascii=False)



dict_doc = {}
for i in range(nD):
    key_doc = webapi['results']['collection1'][i]['property1']['text']
    dict_doc[key_doc] = (Y[i,0],Y[i,1])
with open('json_doc.txt', 'w') as outfile:
  json.dump(dict_doc, outfile,ensure_ascii=False)

dict_word = {}
for i in range(nW):
    key_word = IDword[i]
    dict_word[key_word] = (Y[i+nD,0],Y[i+nD,1])
with open('json_word.txt', 'w') as outfile:
  json.dump(dict_word, outfile,ensure_ascii=False)
