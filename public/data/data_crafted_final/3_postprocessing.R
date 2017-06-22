library(dplyr)
library(readr)
library(magrittr)
library(stringr)
library(forcats)

is_not_empty <- function(string) {
  if(is.na(string) | string == "" | string == ".") {
    return(FALSE)
  } else {
    return(TRUE)
  }
}

is_not_empty = Vectorize(is_not_empty)


(starred_data <- read_csv("./data_output/all_starred_race.csv", col_types = cols(.default = "c")) %>%
  mutate_each(funs(ifelse(is_not_empty(.),.,""))))

# (lookup <- starred_data %>%
#     select(type,`Group ID`) %>% 
#     unique() %>%
#     arrange(type,`Group ID`))

# n_samples <- 10
# n_group_observations <- 1
# n_error_types <- length(unique(lookup$type))
# 
# sampling_matrix <- matrix(ncol = n_samples, nrow = n_error_types*n_group_observations)
# colnames(sampling_matrix) <- paste0("sample_",as.character(1:n_samples))
# rownames(sampling_matrix) <- paste0("type_",(rep(as.character(1:n_error_types),n_group_observations)))

(starred_data <- 
  starred_data %>%
    mutate(`Record ID` = str_extract(`Record ID`,"[0-9]+")))

starred_data %>%
  select(`Group ID`,type,`Record ID`) %>%
  group_by(type,`Record ID`) %>%
  unique() %>% count(type,`Record ID`)

set.seed(1)
for(i in 1:n_samples) {
  
  (gids <- 
    starred_data %>%
      group_by(type,`Record ID`) %>%
        sample_n(1) %$%
          `Group ID`)

  (sample_i <- 
    starred_data %>% filter(`Group ID` %in% gids))
  (gids_ordered <- 
    sample_i %>%
      arrange(type) %>%
        group_by(type) %>%
          do(sample_n(.,size = nrow(.))) %$%
            `Group ID` %>%
            unique())
  
  (lookup <- tibble(`Group ID` = gids_ordered) %>%
    mutate(qnum = 1:n()))
  
  sample_i <- 
    sample_i %>%
      left_join(lookup, by = "Group ID") %>%
        mutate(`Group ID` = qnum) %>%
          select(-qnum) %>%
            arrange(type,`Group ID`)

  #make the names standard
  names(sample_i) <- c("Group ID", "Record ID", 
                           "First Name", "FF", 
                           "Last Name", "LF",
                           "Reg No.", "DoB", "Race",
                           "First Name", "Last Name",
                           "Reg No.", "DoB", "Race",
                           "type","Answer")
  sample_i %>%
    write_csv(paste0(sprintf("./data_output/samples/sample_%02d",i),".csv"))
}


# set.seed(1)
# for(i in 1:n_samples) {
#   gids  <- 
#     lookup %>%
#     group_by(type) %>%
#     sample_n(n_group_observations) %$%
#     `Group ID`
#   sampling_matrix[,i] <- gids
#   sampled_data <- 
#     starred_data %>%
#     filter(`Group ID` %in% gids) 
#   
#   #randomize the order
#   `Group ID` <- sample(gids,length(gids),replace = F)
#   qnum <- 1:length(gids)
#   qnum_lookup <- tibble(`Group ID`,qnum)
#   
#   
#   sampled_data <- 
#     sampled_data %>% 
#     left_join(qnum_lookup, by = "Group ID") %>%
#     mutate(`Group ID` = qnum) %>%
#     select(-qnum) %>%
#     arrange(`Group ID`)
#   
#   
#   #make the names standard
#   names(sampled_data) <- c("Group ID", "Record ID", 
#                            "First Name", "FF", 
#                            "Last Name", "LF",
#                            "Reg No.", "DoB", "Race",
#                            "First Name", "Last Name",
#                            "Reg No.", "DoB", "Race",
#                            "type","Answer")
#   sampled_data %>%
#     write_csv(paste0(sprintf("./data_output/samples/sample_%02d",i),".csv"))
# }
# 
# 
