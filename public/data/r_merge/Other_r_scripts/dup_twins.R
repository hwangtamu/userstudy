library(tidyverse)
library(stringr)
library(stringdist)


mar17 <- read_csv("../yancey1703.csv", col_types = cols(.default = "c"))
apr13 <- read_csv("../yancey1304.csv", col_types = cols(.default = "c"))

organise_dup_twins <- function(data_dup_twins) {
  result <- data_dup_twins %>% 
    select(ID = id,voter_reg_num,dupid,twinid,everything()) %>% 
    arrange(as.numeric(twinid),as.numeric(voter_reg_num))
  result
}

(mar17_dup_twins <- mar17 %>% filter(type == "DT") %>% organise_dup_twins())
(apr13_dup_twins <- apr13 %>% filter(type == "DT") %>% organise_dup_twins())
    

