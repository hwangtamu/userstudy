##############WORKFLOW#############

  load_package <- function(package){
    if(is.element(package, installed.packages()[,1])) {
      library(package, character.only = TRUE)
      return("loaded into memory")
    } else {
      install.packages(package)
      library(package, character.only = TRUE)
      return("installed and loaded into memory")
    }
  } 
  
  load_all_packages <- function(package_list) {
    sapply(package_list, load_package)
  }
  
  core_workflow <- c("magrittr",
                     "stringr",
                     "forcats",
                     "lubridate",
                     "tidyverse")
  
  visualisation <- c("RColorBrewer",
                 "ggthemes", 
                 "viridis",
                 "plotly",
                 "ggvis")
  
  choices <- c(core_workflow, visualisation)
  
  load_all_packages(choices)
  
rm(load_all_packages, choices, visualisation, core_workflow, load_package)