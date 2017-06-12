source("0_header.R")

is_not_empty <- function(string) {
  if(is.na(string) | string == "" | string == ".") {
    return(FALSE)
  } else {
    return(TRUE)
  }
}

is_not_empty = Vectorize(is_not_empty)

(source_data <- read_csv("data/ysame.csv", 
                       col_types = cols(.default = "c")))

same_data <-
  source_data %>%
    mutate_each(funs(ifelse(is_not_empty(.),.,""))) %>% 
      mutate(last_name = str_c(last_name, name_sufx_cd, sep = " "),
             file_id = str_c(src, file_id, sep = "-")) %>%
        mutate_each(funs(str_trim(.))) %>% 
            select(ID, voter_reg_num, last_name, first_name, dob, everything(), -name_sufx_cd,-src, file_id) %T>%
              View()


write_csv(same_data, "./data/pairs.csv")
