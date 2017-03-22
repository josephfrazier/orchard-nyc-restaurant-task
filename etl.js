#!/usr/bin/env node

const fs = require('fs');
const etl = require('etl');
const through2 = require('through2');

let latestGrade;

main();

function main () {
  fs.createReadStream('/dev/stdin')
    .pipe(etl.csv({
      transform: {
        CAMIS: Number,
      }
    }))
    .pipe(through2({objectMode: true}, filterLatest))
    .pipe(through2({objectMode: true}, (chunk, enc, callback) => {
      console.log(chunk);
      callback();
    }))
    //.pipe(etl.mysql.upsert(pool,'testschema','testtable',{concurrency:4 }))
}

// keep track of the record with the most recent 'GRADE DATE'
// when the record's 'CAMIS' changes, push the tracked record
function filterLatest (record, enc, callback) {
  if (!latestGrade) {
    latestGrade = record;
    return callback();
  }

  if (record['CAMIS'] != latestGrade['CAMIS']) {
    this.push(latestGrade);
    latestGrade = record;
    return callback();
  }

  if (Date.parse(record['GRADE DATE']) > Date.parse(latestGrade['GRADE DATE'])) {
    latestGrade = record;
  }

  callback();
}
