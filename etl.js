#!/usr/bin/env node

const fs = require('fs');
const etl = require('etl');
const through2 = require('through2');

fs.createReadStream('/dev/stdin')
  .pipe(etl.csv({
    transform: {
      CAMIS: Number,
    }
  }))
  .pipe(through2({objectMode: true}, (chunk, enc, callback) => {
    console.log(chunk);
    callback();
  }))
  //.pipe(etl.mysql.upsert(pool,'testschema','testtable',{concurrency:4 }))
