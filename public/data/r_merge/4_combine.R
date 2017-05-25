source("0_header.R")

egen <- read_csv("data/egen_pairs.csv", col_types = cols(.default = "c"))
natural <- read_csv("data/natural_differences.csv", col_types = cols(.default = "c"))
twins <- read_csv("data/twins_r.csv", col_types = cols(.default = "c"))
duplicates <- read_csv("data/duplicates_r.csv", col_types = cols(.default = "c"))

all_data <- 
  bind_rows(egen,natural,twins,duplicates) %>%
  mutate(last_name = ifelse(error_nature != "egen" & !is.na(name_sufx_cd),
                            paste(last_name,name_sufx_cd),
                            last_name),
         file = ifelse(file == "mar17",
                       "B",
                       "A")) %>%
  select(-name_sufx_cd)

unique_ID <-
  all_data %$%
  ID %>%
  unique()
(ID_table <- 
    tibble(ID = unique_ID, 
           new_ID = 1:length(unique_ID)))

(all_data <- 
    all_data %>%
    left_join(ID_table) %>%
    mutate(ID = new_ID) %>%
    select(-new_ID) %T>%
    View())

all_data <-
  all_data %>%
  group_by(file) %>% 
  mutate(n = 1:n(), ID_u = paste0(file,"-",n)) %>%
  ungroup() %>% 
  select(ID, everything(), -file,-n, file_id = ID_u) %T>% 
  View()



all_data %>%
  write_csv("data/groups_without_modif.csv")

name_diff <- function(name_1, name_2) {
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
  } else {
    day_diff <- str_c(compare_date(dob_1,dob_2,day),"_day")
    month_diff <- str_c(compare_date(dob_1,dob_2,month),"_month")
    year_diff <- str_c(compare_date(dob_1,dob_2,year),"_year")
    diffs <- c(day_diff,month_diff,year_diff)
    diffs <- str_subset(diffs,"different")
    diffs <- str_c(diffs, collapse = ", ")
    return(diffs)
  }
}


# calculate_all_diff <- function(first_names,last_names,dobs) {
#   #message(paste(first_names[1],last_names[1],dobs[1]))
#   
#   if() 
#     
#     first_name_diff <- ifelse(na_check(first_names), name_diff(first_names), "missing_first_name")
#   last_name_diff <- ifelse(na_check(last_names), name_diff(last_names), "missing_last_name")
#   dobs_diff <- ifelse(na_check(dobs), dob_diff(dobs), "missing_dob")
#   diffs <- c(first_name_diff,last_name_diff,dobs_diff)
#   fields <- c("first_name","last_name","dob")
#   check <- !str_detect(diffs,"same")
#   diffs <- diffs[check]
#   fields <- fields[check]
#   if(length(diffs) == 0) {
#     fields = "all_fields"
#     diffs = "same"
#   }
#   diffs <- str_c(diffs, collapse = ", ")
#   fields <- str_c(fields, collapse = ", ")
#   res <- paste0(fields, ";", diffs)
#   return(res)
# }
# 
# x <- function(c) {
#   print(c)
#   return("x")
# }
# 
# all_data %>% group_by(ID) %>% mutate(x = x(.))
# 
# 
