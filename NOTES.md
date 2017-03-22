* Here's what appears to be a visualization of the data: https://data.cityofnewyork.us/Health/CAMIS-count/trpv-hzf9/data
* You can also use [xsv]: `xsv sort ~/workspace/orchard-nyc-restaurant-task/DOHMH_New_York_City_Restaurant_Inspection_Results.csv | xsv table -c 10 | less`
* Here's a command that provides clues about the schema to use: `xsv stats DOHMH_New_York_City_Restaurant_Inspection_Results.csv | xsv table -c 10`

[xsv]: https://github.com/BurntSushi/xsv
