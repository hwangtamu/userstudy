source("0_header.R")

mar17 <- read_csv("data/yancey1703.csv", col_types = cols(.default = "c"))
apr13 <- read_csv("data/yancey1304.csv", col_types = cols(.default = "c"))

(mar17_twins <- mar17 %>% 
    filter(type == "XT") %>% 
    mutate(file = "mar17") %>% 
    select(ID = id,voter_reg_num,dupid,everything()))
(apr13_twins <- apr13 %>% 
    filter(type == "XT") %>% 
    mutate(file = "apr13") %>% 
    select(ID = id,voter_reg_num,dupid,everything()))

#max 2 twins only (no triplets)
mar17_twins %>%
  group_by(twinid) %>%
    mutate(n = 1:n(), n = max(n)) %>%
      arrange(desc(n)) %>%
        select(n, everything())

create_groups <- function(data_twin) {
  data_twin %>%
    group_by(twinid) %>% 
      mutate(ID = min(as.numeric(voter_reg_num))) %>%
        select(ID, everything()) %>%
          arrange(ID)
}

########grouped and bound##########
apr13_twins_grouped <- create_groups(apr13_twins)
mar17_twins_grouped <- create_groups(mar17_twins)

(twins_combined <- 
    bind_rows(apr13_twins_grouped,mar17_twins_grouped) %>%
      arrange(ID))

########one person twin groups########
twins_combined %>%
  group_by(ID) %>%
  mutate(n = 1:n(), n = max(n)) %>%
  filter(n == 1) %>%
  select(n, everything()) %>%
    View()

#########bound and grouped########
one_twin <- bind_rows(apr13_twins,mar17_twins) %>%
  create_groups() %>%
    arrange(ID) %>% 
  group_by(ID) %>%
  mutate(n = 1:n(), n = max(n)) %>%
  filter(n == 1) %>%
  select(n, everything()) %T>%
  View() %$%
    ID

twins_combined_2 <- 
  bind_rows(apr13_twins,mar17_twins) %>%
    create_groups() %>%
      filter(!(ID %in% one_twin))

twins_combined_2 %>% group_by(ID) %>% mutate(n = n()) %>% filter(n == 1)
  
twins_combined_2<-
  twins_combined_2 %>%
    mutate(modif = NA,
           error_nature = "twins", 
           pos = NA)
           
twins_combined_2 %>% write_csv("data/twins_r.csv")

############ NEW CODE ENDS #################

# address <- "C:/Users/gurud/Google Drive/Research Assistantship/seq/Gurudev Ilangovan/Record Linkage/merge/v3/"
# mar17_twins <- read_csv(paste0(address,"mar17_twins.csv"), col_types = cols(.default = "c"))
# apr13_twins <- read_csv(paste0(address,"apr13_twins.csv"), col_types = cols(.default = "c"))
# mar17 <- read_csv(paste0(address,"yancey1304.csv"), col_types = cols(.default = "c"))
# apr13 <- read_csv(paste0(address,"yancey1703.csv"), col_types = cols(.default = "c"))
# 
# (mar17_twins <- mar17_twins %>% mutate(ID = 1:n()) %>% 
#     select(ID, voter_reg_num, twinid, everything()) %>% arrange(twinid))
# (apr13_twins <- apr13_twins %>% mutate(ID = (1:n())+1000) %>% 
#     select(ID, voter_reg_num, twinid, everything()) %>% arrange(twinid))

# (common_removed <- combined %>% 
#   select(voter_reg_num,twinid,everything(),-ID,-dupid) %>% 
#   distinct() %>%
#   mutate(ID = 1:n()) %>% 
#   arrange(twinid))
# 
# (one_rec_twins <- (common_removed %>% 
#   group_by(twinid) %>% 
#   mutate(n = n()) %>% 
#   filter(n < 2))$twinid %>% as.integer())
# 
# combined %>% filter(twinid %in% one_rec_twins) %>% View()
# common_removed %>% filter(twinid %in% one_rec_twins) %>% View()
# apr13_twins %>% filter(twinid %in% one_rec_twins) %>% View()
# mar17_twins %>% filter(twinid %in% one_rec_twins) %>% View()
# dupids <- (combined %>% filter(twinid %in% one_rec_twins))$dupid %>% as.character()
# apr13 %>% filter(voter_reg_num %in% dupids)
# mar17 %>% filter(voter_reg_num %in% dupids)
# combined %>% filter(voter_reg_num %in% dupids)
# 
# common_removed_2 <- 
#   common_removed %>% 
#   filter(!(twinid %in% one_rec_twins)) %>% 
#   mutate(dupid = NA) %>% 
#   group_by(twinid) %>% 
#   mutate(ID = as.character(as.integer(twinid) + 20000)) %>% 
#   select(ID,voter_reg_num,twinid,everything())
# 
# write_csv(common_removed_2,paste0(address,"twins_r.csv"))
# 
# 
