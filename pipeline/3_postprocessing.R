library(dplyr)
library(readr)
library(magrittr)
library(stringr)
# library(forcats)

is_not_empty <- function(string) {
  if(is.na(string) | string == "" | string == ".") {
    return(FALSE)
  } else {
    return(TRUE)
  }
}

is_not_empty = Vectorize(is_not_empty)

col_names <- c("Group ID", "Reg No.", 
               "FF", "First Name", 
               "Last Name", "LF",
               "DoB", "Sex", "Race",
               "Reg No.", "First Name", "Last Name",
               "DoB", "Sex", "Race",
               "Record ID", "type","Same")

#[Group ID, Reg No., FF, First Name, Last Name, LF, 
# DoB, Race, Reg No., First Name, Last Name, 
#DoB, Race, Record ID, type, Answer]


(starred_data <- read_csv("./data_intermediate/all_starred_race.csv", col_types = cols(.default = "c", `Group ID` = "i")) %>%
  mutate_all(funs(ifelse(is_not_empty(.),.,""))) %>%
    mutate(src = str_extract(`Record ID`, "[AB]")) %>%
      rename(fname = `First Name`,
             lname = `Last Name`))

(fname_freq <- read_csv("./frequencies/fname_freq.csv"))
(lname_freq <- read_csv("./frequencies/lname_freq.csv"))

starred_data <- 
  starred_data %>%
    left_join(fname_freq, by = c("fname","src")) %>%
      mutate(FF = ifelse(!is.na(n),n,1)) %>%
        select(-n)

starred_data <- 
  starred_data %>%
    left_join(lname_freq, by = c("lname","src")) %>%
    mutate(LF = ifelse(!is.na(n),n,1)) %>%
    select(-n)

(starred_data <- 
  starred_data %>%
    mutate(`Record ID` = str_extract(`Record ID`,"[0-9]+")))

starred_data <- 
  starred_data %>%
  select(`Group ID`, `Reg No.`, FF, fname, lname, LF,
         DoB,Sex, Race, `Reg No._1`, `First Name_1`, `Last Name_1`, DoB_1,Sex_1, Race_1, 
         `Record ID`, type, Same) %>%
  arrange(as.numeric(`Group ID`))

starred_data %>%
  select(`Group ID`,type,`Record ID`) %>%
  group_by(type,`Record ID`) %>%
  unique() %>% count(type,`Record ID`)

set.seed(1)
for(i in 1:10) {
  
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
  names(sample_i) <- col_names
  sample_i %>%
    write_csv(paste0(sprintf("./data_output/samples/sample_%02d",i),".csv"))
}

names(starred_data) <- col_names
write_csv(starred_data,"./data_output/allg_starred.csv")

starred_data %>%
  sample_n(nrow(.)) %>%
  write_csv("./data_output/section2.csv")
