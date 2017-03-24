#!/usr/bin/env node

const fs = require('fs');
const etl = require('etl');
const group = require('sorted-group-stream');
const through2 = require('through2');
const schwartzian = require('fort');
const pg = require('pg');
const pgConnectionString = require('pg-connection-string');
const jsonSql = require('json-sql')({
  dialect: 'postgresql',
  namedValues: false,
});

main();

async function main () {
  const pool = new pg.Pool(pgConnectionString.parse(process.env.DATABASE_URL));

  await pool.query('DROP SCHEMA IF EXISTS testschema');
  await pool.query('CREATE SCHEMA testschema');
  await pool.query('DROP TABLE IF EXISTS testtable');
  await pool.query(`CREATE TABLE testtable (
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
  )`)

  fs.createReadStream('/dev/stdin')
    .pipe(etl.csv({
      sanitize: true,
      transform: {
        camis: Number,
        score: Number,
      }
    }))
    .pipe(etl.map(function (record) {
      delete record.__line;
      this.push(record);
    }))
    .pipe(group(record => record.camis))
    .pipe(filterLatest())
    .pipe(etl.collect(1000))
    .pipe(through2({objectMode: true}, async (records, enc, callback) => {
      const sql = jsonSql.build({
        type: 'insert',
        table: 'testtable',
        values: records
      });

      await pool.query(sql.query, sql.values);
      console.log("inserted another 1000 rows");

      callback();
    }))
}

// return the record with the most recent 'grade_date'
function filterLatest () {
  return through2({objectMode: true}, function ({ value: records }, enc, callback) {
    this.push(schwartzian.max(records, record => Date.parse(record.grade_date)));

    callback();
  });
}
