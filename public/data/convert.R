library(tidyverse)
library(lubridate)
library(magrittr)

ans1 <- read_csv("./ans1.csv")

ans1 %>%
  select(-matches("_1"),-FF,-LF,
         ID = `Group ID`,
         voter_reg_num = `Reg No.`,
         last_name = `Last Name`,
         first_name = `First Name`,
         dob = DoB,
         Race,type,
         file_id = `Record ID`,
         answer) %>%
  mutate(dob = format(as_date(dob, format="%m/%d/%Y"), format = "%m/%d/%Y")) %T>%
    View() %>%
      write_csv("./ans2_source.csv")

# ID,voter_reg_num,last_name,first_name,dob,race,type,file_id,answer

# Group ID,Record ID,First Name,FF,Last Name,LF,Reg No.,DoB,Race,type,answer
