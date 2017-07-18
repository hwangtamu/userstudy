library(readr)
library(dplyr)
library(magrittr)
library(ggplot2)
library(ggthemr)


name_tbl <- read_csv("./nmfreq.csv") %>%
  mutate(src = ifelse(src == 1703, "B", "A"))

(fname_freq <- 
  name_tbl %>%
    count(fname,src))

(lname_freq <- 
  name_tbl %>%
    count(lname,src))



write_csv(fname_freq, "./fname_freq.csv")
write_csv(lname_freq, "./lname_freq.csv")

get_random_name <- function(freq_table,category,view = FALSE) {
  if(category == "unique") num = 1
  if(category == "rare") num = seq(2,5,1)
  if(category == "often") num = seq(6,100,1)
  if(category == "common") num = seq(101,100,1)
  x <- 
  freq_table %>%
    filter(n %in% num) 
  
  if(view){
    x %T>%
      View()
  }
    
  x %>%
    sample_n(1) %>%
      pull(1) %>%
        return()
}

get_name_freq <- function(name){
  name <- toupper(name)
  message("first name frequency")
  print(fname_freq %>%
    filter(fname == name) %>%
      pull(n))
  message("last name frequency")
  print(lname_freq %>%
          filter(lname == name) %>%
          pull(n))
}

get_random_name(lname_freq,"often")
get_random_name(fname_freq,"unique",TRUE)
get_name_freq(get_random_name(lname_freq,"unique"))
get_name_freq("mendez")
