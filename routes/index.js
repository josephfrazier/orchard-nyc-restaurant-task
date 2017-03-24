var express = require('express');
var router = express.Router();
const pg = require('pg');
const pgConnectionString = require('pg-connection-string');
const jsonToTable = require('json-to-table');
const Case = require('case');
const escape = require('escape-html');

const pool = new pg.Pool(pgConnectionString.parse(process.env.DATABASE_URL));

/* GET home page. */
router.get('/', async function(req, res, next) {
  const { rows: restaurants } = await pool.query(`
    select * from testtable where cuisine_description = 'Thai' and grade in ('A', 'B') order by grade_date desc limit 10;
  `);
  const [ headers, ...rows ] = jsonToTable(restaurants);

  // TODO this templating should be in views/index.jade,
  // but I haven't figured it out quite yet
  let restaurantsHtml = `
    <table>
      <thead>
        <tr>
          ${headers.map(h => `<th>${escape(Case.capital(h))}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(values => `
          <tr>
            ${values.map(v => `<td>${escape(v)}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  res.render('index', {
    title: 'Restaurants',
    restaurantsHtml,
  });
});

module.exports = router;
