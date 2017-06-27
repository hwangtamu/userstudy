library(readr)
library(dplyr)
library(ggplot2)


name_tbl <- read_csv("./frequencies/nmfreq.csv")

(fname_freq <- 
  name_tbl %>%
    count(fname))

lname_freq <- 
  name_tbl %>%
    count(lname)



write_csv(fname_freq, "./frequencies/fname_freq.csv")
write_csv(lname_freq, "./frequencies/lname_freq.csv")

fname_freq %>%
  ggplot(aes(n)) + geom_histogram()

lname_freq %>%
  ggplot(aes(n)) + geom_histogram()
