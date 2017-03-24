# The Orchard
## Software Engineer Assessment
### The NYC Restaurant Task

Assume you have a friend who loves Thai food, but refuses to eat at any place with less than a B rating by the Health Department.

1. Using the language and data store of your choice, create an ETL (Extract, Transform & Load) job to ingest this ~500k rows DOHMH New York City Restaurant Inspection Results data set from NYC Open Data ([Download Link](https://nycopendata.socrata.com/api/views/xx67-kt59/rows.csv?accessType=DOWNLOAD))

    * The ETL job can be found in [etl.js](etl.js). It reads the CSV sorted by CAMIS from stdin, groups the rows by CAMIS, and stores the row with the latest 'GRADE DATE' in a PostgreSQL database.

2. In addition to submitting working code for the ETL job, please include the schema design along with a quick explanation for the choices made.

    * The schema I chose is a single table of the form shown below. My goal here was to preserve as much information about the restaurants as possible, while ignoring outdated inspection results, since they are presumably not of interest.

    ```sql
    CREATE TABLE testtable (
        camis integer,
        dba text,
        boro text,
        building text,
        street text,
        zipcode text,
        phone text,
        cuisine_description text,
        inspection_date date,
        action text,
        violation_code text,
        violation_description text,
        critical_flag text,
        score integer,
        grade text,
        grade_date date,
        record_date date,
        inspection_type text
      )`
    ```

3. Using your data store, generate a list of the top 10 Thai restaurants that meet your friend's criteria. You could simply provide a SQL query to answer this, but we prefer that you build a web frontend to answer the question. Bonus points for any additional views of the data, including visualizations (geo, charts, graphs, etc).

    * The relevant SQL query is given below, and there is also a simple web frontend showing a table of the results. The frontend can be found at the url mentioned in the next point. I chose to order by grade date because more recent inspection results are presumably more informative about the present time.

    ```sql
    select * from testtable where cuisine_description = 'Thai' and grade in ('A', 'B') order by grade_date desc limit 10;
    ```

4. Note that we expect working software, not pseudo code. Please publish your code on Github and also **deploy** your app to a free service like Heroku, Google App Engine, or Flask so that we can see it in action.

    * The frontend can be found at https://thai-breaker.herokuapp.com/

