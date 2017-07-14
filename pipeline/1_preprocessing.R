library(dplyr)
library(readr)
library(magrittr)
library(stringr)

is_not_empty <- function(string) {
  if(is.na(string) | string == "" | string == ".") {
    return(FALSE)
  } else {
    return(TRUE)
  }
}

is_not_empty = Vectorize(is_not_empty)

(source_data <- read_csv("data_input/allg.csv", 
                         col_types = cols(.default = "c")))
#,file_id = str_c(src, file_id, sep = "-")
(input_data <-
  source_data %>%
  mutate_all(funs(ifelse(is_not_empty(.),.,""))) %>% 
  mutate(last_name = str_c(last_name, name_sufx_cd, sep = " "),
         file_id = str_c(file_id,"-",src)) %>%
  mutate_all(funs(str_trim(.))) %>% 
  select(ID, voter_reg_num, last_name, first_name, dob,sex, race, type, 
         everything(), -name_sufx_cd,-src))

org_names <- c("file_id","voter_reg_num","last_name","first_name","dob","name_sufx_cd","type","ID","src","sex","race","answer")
lookup_2 <- 
  source_data %>%
  select(ID) %>%
  unique() %>%
  mutate(n = 1:n())

source_data_2 <- 
  source_data %>%
  left_join(lookup_2) %>%
  mutate(ID = n) %>%
  select(-n) %>%
  mutate_all(funs(ifelse(is_not_empty(.),.,"")))

names(source_data_2) <- org_names
write_csv(source_data_2,"./data_input/allg_id_ord.csv")    


lookup <- 
  input_data %>%
    select(ID) %>%
      unique() %>%
        mutate(n = 1:n())

input_data <- 
  input_data %>%
    left_join(lookup) %>%
      mutate(ID = n) %>%
        select(-n)




input_data %>%
  group_by(ID) %>%
  mutate(n = n()) %>%
  filter(n != 2) %>%
  select(-n) %>%
  ungroup()


input_data <- 
  input_data %>%
    group_by(ID) %>%
      mutate(n = n()) %>%
        filter(n == 2) %>%
          select(-n) %>%
            ungroup()


write_csv(input_data, "./data_intermediate/all_no_stars.csv")

