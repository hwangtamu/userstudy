library(tidyverse)
library(stringr)
library(stringdist)
library(lubridate)

name_diff <- function(names) {
  name_1 <- names[1]
  name_2 <- names[2]
  len_1 <- str_length(name_1)
  len_2 <- str_length(name_2)
  if((len_1 == 0) || (len_2 == 0)) return("missing")
  edit_distance = stringdist(name_1,name_2,method = "dl")
  if(name_1 == name_2) {
    return ("same")
  } else if((len_1 > len_2) && (str_detect(name_1,name_2))) {
    return ("substring")
  } else if((len_2 > len_1) && (str_detect(name_2,name_1))) {
    return ("substring")
  } else if(edit_distance == 1) {
    return("edit_distance_1")
  } else if((edit_distance/min(len_1,len_2)) < (0.5 * min(len_1,len_2))) {
    return("edit_distance_50%")
  } else {
    return("different")
  }
}

compare_date <- function(date_1,date_2,datepart_function) {
  if(datepart_function(date_1) == datepart_function(date_2)) {
    return("same")
  } else {
    return("different")
  }
}

dob_diff <- function(dobs) {
  if((length(dobs[1]) == 0) || (length(dobs[1]) == 0)) return("missing")
  dob_1 <- mdy(dobs[1])
  dob_2 <- mdy(dobs[2])
  if(dob_1 == dob_2) {
    return("same")
  }
  else {
    day_diff <- str_c(compare_date(dob_1,dob_2,day),"_day")
    month_diff <- str_c(compare_date(dob_1,dob_2,month),"_month")
    year_diff <- str_c(compare_date(dob_1,dob_2,year),"_year")
    diffs <- c(day_diff,month_diff,year_diff)
    diffs <- str_subset(diffs,"different")
    diffs <- str_c(diffs, collapse = ", ")
    return(diffs)
  }
}

na_check <- function(array) {
  na_presence <- sum(is.na(array))
  if(na_presence>0){
    return(FALSE)
  }
  else if(length(array)<2){
    return(FALSE)
  } else {
    return(TRUE)
  }
}

calculate_all_diff <- function(first_names,last_names,dobs) {
  #message(paste(first_names[1],last_names[1],dobs[1]))
  first_name_diff <- ifelse(na_check(first_names), name_diff(first_names), "missing_first_name")
  last_name_diff <- ifelse(na_check(last_names), name_diff(last_names), "missing_last_name")
  dobs_diff <- ifelse(na_check(dobs), dob_diff(dobs), "missing_dob")
  diffs <- c(first_name_diff,last_name_diff,dobs_diff)
  fields <- c("first_name","last_name","dob")
  check <- !str_detect(diffs,"same")
  diffs <- diffs[check]
  fields <- fields[check]
  if(length(diffs) == 0) {
    fields = "all_fields"
    diffs = "same"
  }
  diffs <- str_c(diffs, collapse = ", ")
  fields <- str_c(fields, collapse = ", ")
  res <- paste0(fields, ";", diffs)
  return(res)
}

calculate_edit_distance(c("Hello", "Hlelo"))

rec_changes <- read_csv("../xs_changes.csv", col_types = cols(.default = "c"))
(edits <- rec_changes %>% group_by(ID) %>% mutate(n = n()) %>% 
      mutate(diff = calculate_all_diff(first_name, last_name, dob), 
             modif = ifelse(error_nature == "natural", str_split_fixed(diff,";",2)[,2],modif),
             pos = ifelse(error_nature == "natural", str_split_fixed(diff,";",2)[,1],pos)) %>% 
      select(diff,everything()))
only_diffs <- edits %>% select(ID, modif, pos, everything(), diff) %>% 
  filter(!str_detect(diff,"all_fields")) %>% 
  arrange(ID) 

only_diffs %>% write_csv("../edits_natural.csv")

only_diffs %>% filter(error_nature == "original") %>% 
  select(ID, voter_reg_num, last_name, first_name,dob) %>% 
  write_csv("../original_pair.csv")

only_diffs %>% filter(error_nature != "original") %>% 
  select(ID, voter_reg_num, last_name, first_name,dob) %>%
  write_csv("../error_pair.csv")


only_diffs %>% filter(error_nature != "original") %>% group_by(modif) %>% count() %>% arrange(desc(nn)) %>% View()
only_diffs %>% filter(error_nature != "original") %>% group_by(pos) %>% count() %>% arrange(desc(nn)) %>% View()



