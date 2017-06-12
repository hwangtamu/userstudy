source("0_header.R")


(mar17 <- read_csv("data/ysame1703.csv", 
                  col_types = cols(.default = "c")))

(apr13 <- read_csv("data/ysame1304.csv", 
                  col_types = cols(.default = "c")))

(mar17_xs <-
   mar17 %>%
     filter(type == "XS") %>%
       mutate(file = "mar17",
              ID = as.integer(voter_reg_num)) %>%
         select(ID, everything(),-id))

(apr13_xs <-
    apr13 %>%
    filter(type == "XS") %>%
      mutate(file = "apr13",
             ID = as.integer(voter_reg_num)) %>%
        select(ID = id, everything(),-id))

(mar17_common_reg_xs <-
  mar17_xs %>%
    semi_join(apr13_xs, by = "voter_reg_num"))
  
(apr13_common_reg_xs <-
  apr13_xs %>%
    semi_join(mar17_xs, by = "voter_reg_num"))

#make ID common
(mar17_id_lookup <-
  mar17_common_reg_xs %>%
    select(ID,voter_reg_num))

(apr13_common_reg_xs <- 
  apr13_common_reg_xs %>%
   select(-ID) %>%
     left_join(mar17_id_lookup, by = "voter_reg_num") %>%
       select(ID, everything()))


xs_matches_diffs <- 
  bind_rows(apr13_common_reg_xs,mar17_common_reg_xs) %>%
    select(-file) %>%
      group_by(ID) %>%
        unique() %>%
          mutate(n = n()) %>%
            arrange(ID) %T>%
              View()



#######################################################################################
#################################NATURAL DIFFERENCES###################################
#######################################################################################

(xs_natural_diff <- 
  xs_matches_diffs %>% 
    filter(n > 1) %>%
      select(-n)) %>%
        ungroup()


(xs_natural_diff_apr13 <- 
  xs_natural_diff %>%
    ungroup() %>% 
      semi_join(apr13_common_reg_xs) %>%
        mutate(file = "apr13"))

(xs_natural_diff_mar17 <- 
  xs_natural_diff %>% 
    ungroup %>%
      semi_join(mar17_common_reg_xs) %>%
        mutate(file = "mar17"))

natural_differences <- 
  bind_rows(xs_natural_diff_apr13,xs_natural_diff_mar17) %>%
    arrange(ID) %>%
      mutate(modif = NA,
             pos = NA,
             error_nature = "natural")  

natural_differences %>%
  write_csv("data/natural_differences.csv")

#######################################################################################
#################################EXACT MATCHES#########################################
#######################################################################################

xs_matches <- 
  xs_matches_diffs %>% 
  filter(n == 1) %>%
  select(-n) 

set.seed(1)
(xs_matches_mar <-
  xs_matches %>%
    mutate(file = "mar17", 
           name_sufx_cd = ifelse(is.na(name_sufx_cd),"",name_sufx_cd),
           dob = format(mdy(dob), format="%m-%d-%Y"),
           dob = ifelse(is.na(dob),"", dob)) %>%
      select(ID, voter_reg_num, last_name, first_name, dob, name_sufx_cd) %>%
        ungroup() %>%
           sample_n(1000) %T>%
              write_csv("data/egen_data.csv"))

(xs_matches_apr <- 
  xs_matches %>%
    filter(ID %in% xs_matches_mar$ID) %>%
      mutate(file = "apr13",
             twinid = NA,
             dob = format(mdy(dob), format="%m-%d-%Y"),
             dob = ifelse(is.na(dob),"", dob)) %T>%
        write_csv("data/egen_original.csv") %T>%
          View())

system("C:/Python27/python.exe call_egen.py")

(egen_output <- read_csv("data/data_modified.csv",
                         col_types = cols(.default = "c")) %>%
  mutate(file = "mar17",
         dupid = NA,
         twinid = NA,
         type = "XS",
         ID = as.integer(ID)
         ))

equal_recs <- function(voter_reg_num, first_name, last_name, dob) {
  # message("testing")
  # print(voter_reg_num)
  # print(first_name)
  # print(last_name)
  # print(dob)
  if((sum(is.na(voter_reg_num)) == 1)|
     (sum(is.na(first_name)) == 1)|
     (sum(is.na(last_name)) == 1)|
     (sum(is.na(dob)) == 1)) {
    return(FALSE)
  }
  
  if((length(voter_reg_num) == 1)|((length(first_name) == 1))|(length(last_name) == 1)|(length(dob) == 1)) {
    return(FALSE)
  }
  
  if(voter_reg_num[1]!=voter_reg_num[2]){
    return(FALSE)
  }
  if(first_name[1]!=first_name[2]){
    return(FALSE)
  }
  if(last_name[1]!=last_name[2]){
    return(FALSE)
  }
  if(dob[1]!=dob[2]){
    return(FALSE)
  }
  #message("same")
  return(TRUE)
}

egen_data_pairs <-
  xs_matches_apr %>%
    select(-name_sufx_cd) %>%
      bind_rows(egen_output) %>%
        mutate(modif = NA,
               error_nature = "egen",
               pos = NA) %>%
                   group_by(ID) %>%
                     mutate(equal = equal_recs(voter_reg_num,first_name,last_name,dob)) %>%
                      filter(equal == FALSE) %>%
                        select(-equal) %>%
                          arrange(ID) %T>% 
                            View()

egen_data_pairs %>% write_csv("data/egen_pairs.csv")

