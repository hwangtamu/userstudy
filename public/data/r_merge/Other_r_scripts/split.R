library(tidyverse)
library(stringr)
library(stringdist)
library(lubridate)


rec_changes <- read_csv("../xs_changes.csv", col_types = cols(.default = "c"))
rec_changes %>% filter(error_nature == "original") %>% 
  select(ID, voter_reg_num, last_name, first_name,dob) %>% 
  write_csv("../original_pair.csv")
rec_changes %>% filter(error_nature != "original") %>% 
  select(ID, voter_reg_num, last_name, first_name,dob) %>%
  write_csv("../error_pair.csv")
