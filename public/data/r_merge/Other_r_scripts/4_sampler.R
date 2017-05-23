library(tidyverse)
library(forcats)
library(stringr)

pair_errors <- read_csv("./pair_errors.csv", col_types = cols(.default = "c"))
pair_original <- read_csv("./pair_original.csv", col_types = cols(.default = "c"))

#error types
num_twins <- 20
num_duplciates <-15
num_edit_distance_50 <- 40
num_edit_distance_1 <- 20
num_others <- 50
num_different_year <- 20
num_many_errors <- 5
num_different <- 10
num_substring <- 50


dob <- 50
name <- c(50,25,25)
first_name <- name[2]
last_name <- name[3]

(pair_errors_fct <- pair_errors %>% 
  mutate(modif = fct_lump(modif, n = 9)))

sample_param <- function(modif_name, num_modif){
  pair_errors_fct %>% 
    filter(str_detect(modif,modif_name)) %>% 
    sample_n(size = ifelse(num_modif > nrow(.),nrow(.),num_modif))
}


pair_errors %>% count(modif, sort = T) %>% print(n = 50)
pair_errors %>% count(pos, sort = T)
pair_errors_fct %>% count(modif, sort = T)

set.seed(1)
(dt_1 <- sample_param("twins", num_twins))
(dt_2 <- sample_param("duplicate", num_duplciates))
(dt_3 <- sample_param("different_year",num_different_year))
(dt_4 <- sample_param("substring", num_substring))
(dt_5 <- sample_param("edit_distance_50%", num_edit_distance_50))
(dt_6 <- sample_param("edit_distance_1", num_edit_distance_1))
(dt_7 <- sample_param("others", num_others))
(dt_8 <- sample_param("different", num_different))


(dt_all <- bind_rows(dt_1,dt_2,dt_3,dt_4,dt_5,dt_6,dt_7,dt_8) %>% unique())

pair_original %>% semi_join(dt_all, by = c("ID")) 

pair_errors %T>%
  View() %>%
    ggplot(aes(fct_infreq(fct_lump(modif, n = 9)))) + geom_bar(aes(fill = ..count..))
