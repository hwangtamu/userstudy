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

(source_data <- read_csv("data_input/all.csv", 
                         col_types = cols(.default = "c")))
#,file_id = str_c(src, file_id, sep = "-")
(input_data <-
  source_data %>%
  mutate_each(funs(ifelse(is_not_empty(.),.,""))) %>% 
  mutate(last_name = str_c(last_name, name_sufx_cd, sep = " ")) %>%
  mutate_each(funs(str_trim(.))) %>% 
  select(ID, voter_reg_num, last_name, first_name, dob, race, type, 
         everything(), -name_sufx_cd,-src))

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

