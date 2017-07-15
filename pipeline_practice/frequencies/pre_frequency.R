library(readr)
library(dplyr)
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
