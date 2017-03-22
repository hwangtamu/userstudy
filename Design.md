# Design of the Synthetic Data Geneator

## Contents
1. [Background](#background)
2. [Related Work](#related-work)
3. [Data Source](#data-source)
4. [Data Preprocessing](#data-preprocessing)
5. [Error Generation](#error-generation)
6. [Expected Outcome](#expected-outcome)
7. [Appendix](#appendix)



## Background

## Related Work

## Data Source

The raw data we use is from the North Carolina 
Voter Registration Database:
https://dl.ncsbe.gov/data/

A Python downloader script is used to collect the 
data from the link:

```python
import sys, requests
from tqdm import tqdm

link = 'https://s3.amazonaws.com/dl.ncsbe.gov/data/'

# prefix can be modified as needed
prefix = ['ncvoter','ncvhis'] # the prefixes of the datasets

def download(file_name):
    url = link + file_name
    response = requests.get(url)
    total = int(response.headers.get('content-length'))
    with open('data/'+file_name, 'wb') as f:
        for data in tqdm(response.iter_content(),total=total,unit='B', unit_scale=True,desc=file_name):
            f.write(data)

if __name__ == '__main__':
    # the overall dataset prefix + _Statewide.zip is not included here
    for i in range(1, 100):
        for j in prefix:
            file_name = j + str(i) + '.zip'
            download(file_name)
```

198 files (2 files for each county in North Carolina) 
from the database will be downloaded once the script is 
executed.

The datasets are updated very often, so we simply use data 
downloaded from different time periods as the base datasets
for the synthetic data generation.

## Data Preprocessing

#### Field Filter
There are 71 columns that exist in a North Carolina Voter Registration 
dataset, which is too many for a human inspector to focus on. See 
[Appendix 1](#1-full-list-of-the-field-names) for the full list of the field names. 


Since most of the fields are optional, and many of them are usually 
same or dependent with other field(s) (e.g. `zipcode` and `mail_zipcode` 
are usually same with each other), we filter the fields based on the
richness of information.

Field names we select:
```
1. voter_reg_num
2. last_name
3. first_name
4. race_code
5. gender_code
6. birth_age
```
`voter_reg_num` is the unique voter registration number which is 
a helpful identification number. `race_code` and `gender_code` use
one capital letter to denote the race and gender of a person. `birth_age`
is an integer that denotes the age of a person. `birth_age` can be
extended to date of birth if needed.

#### Conversion from Age to DoB (Optional)
Since the data is used in pairwise comparisons across datasets, if two
records are similar and are likely to be from the same person, the 
Dob in the pair of records should also be similar.

Strategy: Use a hash function that maps the other information to a date:
```python
def dob(voter_reg_num, last_name, first_name,race_code,gender_code, birth_age):
    # abbreviation
    v, l, f, r, g, b = voter_reg_num, last_name, first_name, race_code, gender_code, birth_age
    # concatenation of the fields
    concat = lambda v, l, f, r, g, b : ' '.join([v, l, f, r, g, b]) 
    info = concat(v, l, f, r, g, b)
    # There are infinitely many hash functions that can map an arbitrary 
    # string to a number within a given range and thus a date. 
    # (e.g. convert to ascii values)
    # Here I show a simple hash method:
    from datetime import date
    import calendar
    # This line returns a string in the format of YYYY-MM-DD
    ymd = date.fromordinal(sum([ord(x) for x in info])).isoformat()
    # The year of birth can be predicted by the birth_age,
    # then the date of birth can be generated
    year = 2017-int(b)
    # leap year 02-29 validation
    while '02-29' in ymd and not calendar.isleap(year):
        year -= 1
    return str(year)+ymd[5:]
```
Now we can replace `birth_age` with `dob` freshly generated.

## Error Generation
Inspired by [Febrl](https://github.com/hwangtamu/febrl/blob/master/dsgen/generate.py),
according to the mechanisms, the errors can be classifies into typos and misspellings. A typo is a
random error caused by the mistyping on keyboard. A misspelling is a
systematic error that often happens repetitively. The causes of
misspellings can be the poor quality of data source, the migration from
another language, or even homophones. Most of the errors are typos.

Example:
```
Typos:
the -> teh  orange -> irange  apple -> appple

Mispellings:
sea -> see  New York -> Newyork  weight -> wait
```
Based on the actual operations of error generation, typo can be 
classified as:

1. insertion
2. omission
3. transposition
4. substitution

Next I'll discuss how to generate errors.
#### Typos Generation
In typo generation, we take the keyboard layout into 
consideration. Keyboard substitutions gives two dictionaries with the 
neigbouring keys for all letters both for rows and columns (based on 
ideas implemented by Mauricio A. Hernandez in his dbgen):
```python
rows = {'a':'s',  'b':'vn', 'c':'xv', 'd':'sf', 'e':'wr', 'f':'dg', 'g':'fh',
        'h':'gj', 'i':'uo', 'j':'hk', 'k':'jl', 'l':'k',  'm':'n',  'n':'bm',
        'o':'ip', 'p':'o',  'q':'w',  'r':'et', 's':'ad', 't':'ry', 'u':'yi',
        'v':'cb', 'w':'qe', 'x':'zc', 'y':'tu', 'z':'x',
        '1':'2',  '2':'13', '3':'24', '4':'35', '5':'46', '6':'57', '7':'68',
        '8':'79', '9':'80', '0':'9'}

cols = {'a':'qzw','b':'gh', 'c':'df', 'd':'erc','e':'d', 'f':'rvc','g':'tbv',
        'h':'ybn','i':'k',  'j':'umn','k':'im', 'l':'o',  'm':'jk', 'n':'hj',
        'o':'l',  'p':'p',  'q':'a',  'r':'f',  's':'wxz','t':'gf',  'u':'j',
        'v':'fg', 'w':'s',  'x':'sd', 'y':'h',  'z':'as'}
```

#### Misspellings Generation
Misspellings are a little more complicated than typos since they are not
generated randomly. A lookup table is needed to determine how a
misspelling error should occur.
Part of the lookup table used in Febrl:
```
         aaliyah : alaiyah
         abigail : abbey, abbie, abby, abii
        adelaide : addie, addy, adel, adela, adele, adeline, adelle
         adriana : adrienne
           agnes : aggie
          aileen : eileen, ileen
      aikaterina : akaterina
           aimee : aime
         ainsley : ainsly
           alana : allana, alanna, allanah, alannah
         aleesha : aleisha, alessia, alysha, alyssa
          alexis : alexys
       alexandra : alexa, alexia, alexanda, alexanderia,
                   alexandria, sandie, sandra, sandy, alessandra,
                   alessandria, lexie
```
#### Steps of Error Generation

1. Construct the lookup tables. (I'm not sure how much effort is 
sufficient to build up new lookup tables, at least we can borrow 
them from Febrl or some other data providers). 

2. Set up distribution for all kinds of errors (insertion, omission,
transposition, substitution, and misspellings). 
Based on some previous research, the distribution of typo errors on
average is: 

    37% omission,
    31% insertion,
    18.5% substitution,
    13.5% transposition.

    Suppose there are 80% errors are typos and 20% errors are 
misspellings, the overall distribution should be:
    
    29.6% omission, 
    24.8% insertion, 
    14.8% substitution, 
    10.8% transposition,
    20.0% misspelling
    
3. Set up an overall error rate and determine the error type whenever
an error should occur. 

    Example: if the error rate is 5%, each record
has 5% change for an error to occur. If a random number falls into 
the 5% domain, then an error occurs in the selected record (there's
0.25% chance for a record to contain multiple errors).
   
   First determine if the misspelling error can occur using the same 
random number strategy. We examine the misspelling error first because
only the first and last names here can contain misspelling errors. 
   
   If a misspelling is going to occur, the first name and last name
have equal chance to contain it, so does each misspelled name in the
lookup table. A misspelled name is selected to replace the corresponding
name in the dataset.

    If a misspelling is not going to occur, similar strategy of typo
selection is used, and the keyboard layout dictionary is used if
there's a substitution or insertion error.

## Expected Outcome

We are going to build a software that can generate synthetic data 
based on the clean data in real world. 

#### Input

1. North Carolina Voter Registration data with two different time 
stamps. Different time stamps can make the base data sets slightly
different with each other. See [Appendix 2](#2-differences-between-north-carolina-voter-registration-data-in-apr-2013-and-mar-2017).
2. A lookup table that maps first and last names to their common
misspellings.
3. An error rate.

#### Operations

1. __Error generation__. Each of the two base data sets is processed 
independently. Errors are generated based on the methods discussed in 
the previous chapter.
2. __Ground truth formation__. Ground truth is essential for analyzing
the performance of record linkage. We set the ground truth of 
record linkage pairs based on the `voter_reg_num` in the base data sets.
Records with the same `voter_reg_num` are considered as the records 
from the same person.

#### Output
1. Two sets of synthetic data.
2. Ground truth for record linkage.

## Appendix

#### 1. Full List of the field names:
```
1. county_id
2. county_desc
3. voter_reg_num
4. status_cd
5. voter_status_desc
6. reason_cd
7. voter_status_reason_desc
8. absent_ind
9. name_prefx_cd
10. last_name
11. first_name
12. middle_name
13. name_suffix_lbl
14. res_street_address
15. res_city_desc
16. state_cd
17. zip_code
18. mail_addr1
19. mail_addr2
20. mail_addr3
21. mail_addr4
22. mail_city
23. mail_state
24. mail_zipcode
25. full_phone_number
26. race_code
27. ethnic_code
28. party_cd
29. gender_code
30. birth_age
31. birth_state
32. drivers_lic
33. registr_dt
34. precinct_abbrv
35. precinct_desc
36. municipality_abbrv
37. municipality_desc
38. ward_abbrv
39. ward_desc
40. cong_dist_abbrv
41. super_court_abbrv
42. judic_dist_abbrv
43. nc_senate_abbrv
44. nc_house_abbrv
45. county_commiss_abbrv
46. county_commiss_desc
47. township_abbrv
48. township_desc
49. school_dist_abbrv
50. school_dist_desc
51. fire_dist_abbrv
52. fire_dist_desc
53. water_dist_abbrv
54. water_dist_desc
55. sewer_dist_abbrv
56. sewer_dist_desc
57. sanit_dist_abbrv
58. sanit_dist_desc
59. rescue_dist_abbrv
60. rescue_dist_desc
61. munic_dist_abbrv
62. munic_dist_desc
63. dist_1_abbrv
64. dist_1_desc
65. dist_2_abbrv
66. dist_2_desc
67. confidential_ind
68. age
69. ncid
70. vtd_abbrv
71. vtd_desc
```

#### 2. Differences Between North Carolina Voter Registration Data in Apr. 2013 and Mar. 2017

```
County  Old_Pop New_Pop Diff    Percent
1	105952	112415	2715	2.49%
2	26799	26980	593	2.21%
3	8260	8431	154	1.85%
4	19047	19093	588	3.08%
5	20771	21087	425	2.03%
6	13573	13321	254	1.89%
7	36709	37708	1010	2.71%
8	16409	16073	327	2.01%
9	25620	26017	668	2.59%
10	92157	107441	1848	1.85%
11	207811	221745	5204	2.42%
12	63980	64434	1347	2.10%
13	130117	144737	3239	2.36%
14	58167	59114	1282	2.19%
15	8020	8446	129	1.57%
16	57036	59120	1311	2.26%
17	17306	17396	262	1.51%
18	113719	115670	2380	2.08%
19	51476	57479	1022	1.88%
20	23600	24997	450	1.85%
21	11835	11789	183	1.55%
22	9994	10172	221	2.19%
23	69703	72108	1513	2.13%
24	41753	41674	1012	2.43%
25	78850	79714	1825	2.30%
26	235036	249671	6305	2.60%
27	19458	21288	333	1.63%
28	31425	32779	571	1.78%
29	114066	117245	2539	2.20%
30	31134	32633	574	1.80%
31	32972	33665	773	2.32%
32	235471	259196	6249	2.53%
33	43822	43205	837	1.92%
34	274436	291896	7066	2.50%
35	43912	47744	971	2.12%
36	145286	154237	4324	2.89%
37	9081	9369	180	1.95%
38	7409	7176	191	2.62%
39	40205	42459	1007	2.44%
40	12634	12843	245	1.92%
41	393388	414704	8966	2.22%
42	42381	42609	939	2.21%
43	76091	81975	1754	2.22%
44	47619	49434	1006	2.07%
45	87233	93784	1900	2.10%
46	17088	17291	310	1.80%
47	32166	35005	772	2.30%
48	4013	3869	72	1.83%
49	119772	128733	2579	2.08%
50	30594	32327	620	1.97%
51	119506	133309	3014	2.38%
52	8550	8486	139	1.63%
53	38415	40546	928	2.35%
54	44310	44032	1021	2.31%
55	57319	61291	1270	2.14%
56	28438	29396	638	2.21%
57	18394	19073	406	2.17%
58	20108	19615	404	2.03%
59	31343	32400	717	2.25%
60	721398	793423	21960	2.90%
61	13313	12773	258	1.98%
62	18501	18577	435	2.35%
63	72775	77131	1320	1.76%
64	75129	75741	1430	1.90%
65	177505	189352	4665	2.54%
66	17307	16674	310	1.82%
67	105160	116341	2846	2.57%
68	125830	133194	2122	1.64%
69	10912	11016	200	1.82%
70	32355	32646	716	2.20%
71	40555	44767	798	1.87%
72	10917	11181	208	1.88%
73	28536	29706	648	2.23%
74	128371	137434	3527	2.65%
75	17739	18117	313	1.75%
76	98247	100335	2422	2.44%
77	34077	34066	913	2.68%
78	83988	85734	2278	2.68%
79	66661	66990	1705	2.55%
80	101468	104959	2233	2.16%
81	48828	50175	1306	2.64%
82	41509	42584	1152	2.74%
83	25261	25376	540	2.13%
84	44573	45793	1140	2.52%
85	34034	34421	640	1.87%
86	49083	50487	1387	2.79%
87	11575	11594	251	2.17%
88	27803	28964	520	1.83%
89	2921	2896	51	1.75%
90	147174	163084	3190	2.06%
91	33664	33965	688	2.03%
92	715047	792684	26073	3.46%
93	16063	15888	413	2.59%
94	10316	10116	161	1.58%
95	50865	52429	758	1.47%
96	82246	84477	3087	3.70%
97	46554	47890	1160	2.46%
98	60347	61608	1475	2.42%
99	26478	26590	603	2.27%
```
