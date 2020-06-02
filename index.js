const express = require('express')
const path = require('path')
var bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://ygphzmpwyhcepp:9da76288497e82d37cc54a7c64619ba212e914d310ff2a3b5600ad548ee2900b@ec2-34-200-101-236.compute-1.amazonaws.com:5432/d8u5klrifr3d64',
  ssl: {
    rejectUnauthorized: false
  }
});

express()
 .use(bodyParser.urlencoded({ extended: true }))
.use(bodyParser.json())
.use(express.static(path.join(__dirname, 'public')))
.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
})

.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => res.render('pages/index'))

.post('/api/query', (req, res) => {
  //console.log(req.body);
  const { id_device, statedoor } = req.body;
  //console.log(id_device);
  //console.log(statedoor);
  

  pool.query('INSERT INTO esp32 (id_device, statedoor) VALUES($1, $2)',[id_device,statedoor ])
  .then(res.status(200).send('aded')) // brianc
  .catch(err => send('Error '+ err));
})

.get('/text', (req, res) => res.send("text"))

.get('/api/query', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM esp32');
    const results = { 'results': (result) ? result.rows : null};
    res.send(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

.get('/times', (req, res) => res.send(showTimes()))
.get('/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM test_table');
    const results = { 'results': (result) ? result.rows : null};
    res.render('pages/db', results );
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

.get('/api/esp32', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM esp32');
    const results = { 'results': (result) ? result.rows : null};
    res.send(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

.put('/api/esp32', async (req, res) =>  {
  //const id_device = req.params.id_device;
  const { id_device, statedoor, timetoopen, timetoclose } = req.body

  pool.query('UPDATE esp32 SET statedoor = $1 , timetoopen = $2, timetoclose = $3 WHERE id_device = $4',[statedoor, timetoopen, timetoclose,id_device ])
  .then(res.status(200).send('updated')) // brianc
  .catch(err => console.error('Error executing query', err.stack))

})

.get('/api/coops', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM coops');
    res.send(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

.get('/api/coop/:id', async (req, res) => {
  //const id = parseInt(request.params.id)
  const id = req.params.id;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM coops  WHERE id_device = $1',[ id ]);
    res.send(result.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

.post('/api/coop/:id', async (req, res) =>  {
  //const id_device = req.params.id_device;
  const { id_device, statedoor, timetoopen, timetoclose, num_chickens,num_chicken_in_coop } = req.body;
  
  pool.query('INSERT INTO coops (id_device, state_door, time_to:open, time_to_close,  num_chickens, num_chicken_in_coop) VALUES($1, $2, $3, $4, $5, $6)',[id_device,state_door, time_to_open, time_to_close, num_chickens,num_chicken_in_coop])
  .then(res.status(200).send('added chicken device')) // brianc
  .catch(err => console.error('Error executing query', err.stack))
})

.put('/api/coop/:id', async (req, res) =>  {
  //const id_device = req.params.id_device;
  const { id_device, state_door, time_to_open, time_to_close, num_chickens,num_chicken_in_coop } = req.body;
  
  pool.query('UPDATE coops SET state_door=$2, time_to_open = $3, time_to_close = $4,  num_chickens = $5, num_chicken_in_coop = $6 WHERE id_device= $1',[id_device,state_door, time_to_open, time_to_close, num_chickens,num_chicken_in_coop])
  .then(res.status(200).send('updated chicken device')) // brianc
  .catch(err => console.error('Error executing query', err.stack))
})


.listen(PORT, () => console.log(`Listening on ${ PORT }`));


showTimes = () => {
  let result = '';
  const times = process.env.TIMES || 5;
  for (i = 0; i < times; i++) {
    result += i + ' ';
  }
  return result;
}