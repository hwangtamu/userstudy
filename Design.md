# Design of the Synthetic Data Geneator

## Contents
1. [Background](#Backgound)
2. [Related Work](#Related Work)
3. [Data Source](#Data Source)
4. [Error Generation](#Error Generation)
5. [Appendix](#Appendix)



## Background

## Related Work

## Data Source

The raw data we use is from the North Carolina 
Voter Registration Database:
https://dl.ncsbe.gov/data/

A Python downloader script is used to collect the 
data in the link:

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

### Field Filter
There are 71 columns that exist in a North Carolina Voter Registration 
dataset, which is too many for a human inspector to focus on. See 
Appendix for the full list of the field names. 


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

### Conversion from Age to DoB (Optional)
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
    # Here I show a simple hash methods:
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
the errors can be classifies into typos and misspellings. A typo is a
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
### Typos Generation
In typo generation, we take the keyboard layout into consideration:
```python
# Keyboard substitutions gives two dictionaries with the neigbouring keys for
# all letters both for rows and columns (based on ideas implemented by
# Mauricio A. Hernandez in his dbgen).
#
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

### Misspellings Generation

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
