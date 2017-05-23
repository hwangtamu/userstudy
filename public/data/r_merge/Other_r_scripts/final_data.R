library(tidyverse)
library(stringr)
library(stringdist)
library(lubridate)

duplicates <- read_csv("./duplicates_r.csv", col_types = cols(.default = "c"))
twins <- read_csv("./twins_r.csv", col_types = cols(.default = "c"))
original_egs_natural <- read_csv("../edits_natural.csv", col_types = cols(.default = "c"))
original <- read_csv("../original_pair.csv", col_types = cols(.default = "c"))
egs_natural <- read_csv("../error_pair.csv", col_types = cols(.default = "c"))

glimpse(duplicates)
glimpse(twins)
glimpse(egs_natural)
glimpse(original)
glimpse(original_egs_natural)

####cleaning#########
glimpse(original_egs_natural)
(base <- 
  original_egs_natural %>% 
  select(-diff,-n,-field))
glimpse(base)

glimpse(duplicates)
(duplicates_final <- 
  duplicates %>% 
  select(-name_sufx_cd) %>% 
  group_by(ID) %>% 
  mutate(error_nature = c("natural","original")))
glimpse(duplicates_final)

glimpse(twins)
(twins_final_1 <- 
  twins %>% 
  select(-name_sufx_cd) %>% 
  mutate(modif = "twins", 
         pos = NA) %>% 
  group_by(ID) %>% 
  mutate(n = n()) %>% 
  filter(n > 2) %>% 
  mutate(error_nature =  c("original","natural","natural")) %>% 
  ungroup() %>% 
  select(-n))

(twins_final_2 <- 
    twins %>% 
    select(-name_sufx_cd) %>% 
    mutate(modif = "twins", 
           pos = NA) %>% 
    group_by(ID) %>% 
    mutate(n = n()) %>% 
    filter(n == 2) %>% 
    mutate(error_nature =  c("original","natural")) %>% 
    ungroup() %>% 
    select(-n))

twins_final <- bind_rows(twins_final_1,twins_final_2)
glimpse(twins_final)

(all_data <- bind_rows(base, twins_final, duplicates_final))

pair_original <- all_data %>% 
  filter(error_nature == "original") 
pair_original %>% write_csv("pair_original.csv")

pair_errors <- all_data %>% 
  filter(error_nature != "original")
pair_errors %>% write_csv("pair_errors.csv")





