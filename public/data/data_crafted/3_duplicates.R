source("0_header.R")

mar17 <- read_csv("data/yancey1703.csv", 
                  col_types = cols(.default = "c"))
apr13 <- read_csv("data/yancey1304.csv", 
                  col_types = cols(.default = "c"))

(mar17_duplicates <- 
    mar17 %>% 
      filter(type == "DS") %>% 
        mutate(file = "mar17") %>% 
          select(ID = id,voter_reg_num,dupid,everything()))
(apr13_duplicates <- 
    apr13 %>% 
      filter(type == "DS") %>% 
        mutate(file = "apr13") %>% 
          select(ID = id,voter_reg_num,dupid,everything()))


create_groups <- function(data_dup) {
  data_dup %>%
    rowwise() %>%
      mutate(grp_id = 
             min(as.numeric(voter_reg_num),
                 as.numeric(dupid)),
             ID = grp_id) %>%
                select(-grp_id,ID, everything())
                   
}


(mar17_duplicates_grouped <- create_groups(mar17_duplicates))
(apr13_duplicates_grouped <- create_groups(apr13_duplicates))

common_dob_errors <- intersect(mar17_duplicates$voter_reg_num,apr13_duplicates$voter_reg_num)


duplicates  <- bind_rows(mar17_duplicates_grouped, apr13_duplicates_grouped) %>%
    arrange(ID) %>%
      mutate(modif = NA,
             pos = NA,
             error_nature = "duplicate") %>%
               select(-grp_id)


duplicates %>%
  group_by(ID) %>%
    mutate(n = 1:n(), n = max(n)) %>%
      arrange(desc(n)) %>%
        select(n, everything()) %>%
          View()

extract_unique_elements <- function(non_unique_data) {
  
  unique_data <- 
    non_unique_data %>%
    group_by(voter_reg_num,first_name,last_name,dob) %>%
    mutate(n = n(),
           file = ifelse(n == 2, 
                         "both", 
                         file)) %>%
    ungroup() %>%
    select(-n) %>%
    unique()
  
  unique_data <- 
    unique_data %>%
    mutate(file = ifelse(file == "both", 
                         sample(c("mar17","apr13"),1),
                         file))
  
  return(unique_data)
}


set.seed(1)
duplicates <-
  duplicates %>%
  group_by(ID) %>% 
  mutate(n = n()) %>%
  arrange(desc(n)) %>%
  do(extract_unique_elements(.))



write_csv(duplicates, "data/duplicates_r.csv")


duplicates %>% group_by(ID) %>% slice(1)
duplicates %>% group_by(ID) %>% slice(2)



# create_groups <- function(data_dup) {
#   #data_dup <- apr13_duplicates
#   (data_dup_lookup <- data_dup %>% mutate(n=1:n()) %>% select(voter_reg_num,n))
#   (data_dup_lookup_2 <- data_dup %>% 
#       mutate(n=1:n()) %>% 
#       select(voter_reg_num = dupid,n))
#   (lookup <- bind_rows(data_dup_lookup,data_dup_lookup_2) %>% 
#     group_by(voter_reg_num) %>% 
#     mutate(group_id = min(n)) %>%
#     select(-n) %>% 
#     arrange(group_id) %>% unique())
#   (lookup <- lookup %>% 
#     group_by(group_id) %>% 
#     mutate(group_id_alt = min(as.integer(voter_reg_num)) + 30000) %>% 
#     ungroup() %>% 
#     select(-group_id, ID = group_id_alt))
#   data_dup %>% select(-ID) %>% 
#     left_join(lookup,by = c("voter_reg_num")) %>% 
#     select(ID, everything()) %>% 
#     arrange(ID)
# }


# duplicates  <- bind_rows(mar17_duplicates_grouped, apr13_duplicates_grouped) %>%
#   filter(!((voter_reg_num %in% common_dob_errors)|
#              (dupid %in% common_dob_errors))) %>%
#     arrange(ID) %>%
#       mutate(modif = NA, 
#              pos = NA, 
#              error_nature = "duplicate")
