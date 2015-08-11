To analyze data, pull it from the database, process the data, then merge and convert the data, and analyze it with R using the scripts described below.

See `backups/readme.md` for a sample dataset you can load.

pull.sh
===

Step one. This script pulls data from Redis and stores it in results/data.json. Data.json contains all fields you saved when calling `experimentr.data()` and `experimentr.save()` on the front-end.

Note: experimentr does not enforce a data schema, so any individual entry in data.json may be missing values you want in your analysis. This is handled in the convert step.

    ./pull.sh

process.sh
===

Processes all 'results/xx_data.json' into useful data fields for analysis.

`./process.sh`

merge.sh
===

Merges all processed participant data files 'results/processed_xx_data.json' into one 'results/merged_data.json'

Before running `./merge.sh`, you will want to process the data see `process.sh`

    `./merge.sh`

convert.sh
===

Convert converts 'results/merged_data.json' to 'results/merged_data.csv'

Before running `./convert.sh`, you will need a merged data set, see `merge.sh`

    ./convert.sh

analyze.sh
===

Analyze runs 'src/analyze.r' on results/merged_data.csv. Check out 'src/analyze.r' for some sample R functions and charts.

    ./analyze.sh
