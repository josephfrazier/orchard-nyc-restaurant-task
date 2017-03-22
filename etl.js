#!/usr/bin/env node

const fs = require('fs');
const etl = require('etl');
const group = require('sorted-group-stream');
const through2 = require('through2');
const schwartzian = require('fort');
const pg = require('pg');
const jsonSql = require('json-sql')({
  dialect: 'postgresql',
  namedValues: false,
});

main();

async function main () {
  const pool = new pg.Pool(process.env.DATABASE_URL);

  try {
    await pool.query('DROP SCHEMA IF EXISTS testschema');
    await pool.query('CREATE SCHEMA testschema');
    await pool.query('DROP TABLE IF EXISTS testtable');
    await pool.query(`CREATE TABLE testtable (
      "CAMIS" integer,
      "DBA" text,
      "BORO" text,
      "BUILDING" text,
      "STREET" text,
      "ZIPCODE" text,
      "PHONE" text,
      "CUISINE DESCRIPTION" text,
      "INSPECTION DATE" date,
      "ACTION" text,
      "VIOLATION CODE" text,
      "VIOLATION DESCRIPTION" text,
      "CRITICAL FLAG" text,
      "SCORE" integer,
      "GRADE" text,
      "GRADE DATE" date,
      "RECORD DATE" date,
      "INSPECTION TYPE" text,
      "__line" integer
    )`)
  } catch (err) {
    console.error(err);
  }

  fs.createReadStream('/dev/stdin')
    .pipe(etl.csv({
      transform: {
        CAMIS: Number,
        SCORE: score => score.length ? Number(score) : null,
        'GRADE DATE': date => date.length ? date : null,
        'RECORD DATE': date => date.length ? date : null,
      }
    }))
    .pipe(group(chunk => chunk['CAMIS']))
    .pipe(filterLatest())
    .pipe(etl.collect(1000))
    .pipe(through2({objectMode: true}, async (chunk, enc, callback) => {
      // console.error(chunk);

      const sql = jsonSql.build({
        type: 'insert',
        table: 'testtable',
        values: chunk
      });

      try {
        await pool.query(sql.query, sql.values);
      } catch (err) {
        console.error(err);
      }

      callback(); // TODO remove this pipe entirely
    }))
    //.pipe(etl.postgres.upsert(pool,'testschema','testtable',{concurrency:4}))
}

// keep track of the record with the most recent 'GRADE DATE'
// when the record's 'CAMIS' changes, push the tracked record
function filterLatest () {
  return through2({objectMode: true}, function ({ value: records }, enc, callback) {
    this.push(schwartzian.max(records, record => Date.parse(record['GRADE DATE'])));

    callback();
  });
}
