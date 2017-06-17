library(tidyverse)
library(stringr)
library(magrittr)

library(countrycode)

depts <- read_csv("C:/Users/gurud/Desktop/new 2.csv", col_names = F)

depts <-
  depts %>%
    mutate(depts = str_extract(X1, pattern = ">[A-Z]{4} - [A-z 0-9 :punct:]*<"),
           four_code = str_extract(X1, pattern = ">[A-Z]{4}"),
           four_code = str_sub(four_code,2)) %T>%
      View()

depts %>%
  write_csv("dept_list.csv")


countrycode <- countrycode_data
countries <- countrycode %$%
  country.name.en
countries <- c("Please select your country",countries)

tibble(countries) %>%
  write_csv("countries.csv")
