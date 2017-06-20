library(tidyverse)
library(lubridate)
library(magrittr)

is_not_empty <- function(string) {
  if(is.na(string) | string == "" | string == ".") {
    return(FALSE)
  } else {
    return(TRUE)
  }
}

is_not_empty = Vectorize(is_not_empty)

ans1 <- read_csv("./ans1.csv")

ans2 <- ans1 %>%
  mutate(DoB = format(as_date(DoB, format="%m/%d/%Y"), format = "%m/%d/%Y")) %>%
  mutate_each(funs(ifelse(is_not_empty(.),.,""))) %>%
  select(-matches("_1"),-FF,-LF,
         ID = `Group ID`,
         voter_reg_num = `Reg No.`,
         last_name = `Last Name`,
         first_name = `First Name`,
         dob = DoB,
         race = Race,
         type,
         file_id = `Record ID`,
         answer) %T>%
    View() 

ans2 %>%
  select(ID,voter_reg_num,last_name,first_name,dob,race,type,file_id,answer) %>% 
  arrange(type,ID) %>% 
  write_csv("./ans2_source.csv")

ans2_stars <- read_csv("./ans2_stars.csv") %>% arrange(type) %>% mutate_each(funs(ifelse(is_not_empty(.),.,"")))
  

names(ans2_stars) <- c("Group ID", "Record ID", 
                       "First Name", "FF", 
                       "Last Name", "LF",
                       "Reg No.", "DoB", "Race",
                       "First Name", "Last Name",
                       "Reg No.", "DoB", "Race",
                       "type","Answer")

ans2_stars %>%
  write_csv("./ans2_stars.csv")
