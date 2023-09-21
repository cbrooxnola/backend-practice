const pg = require('pg')
const cors = require('cors')
const express = require('express')
const app = express()
const client = new pg.Client('postgres://localhost/dolphins')
const morgan = require('morgan')
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

app.get('/api/players', async(req,res,next)=>{
  try {
    const SQL = `
      SELECT *
      FROM players
    `;
    const response = await client.query(SQL);
  } catch(error){
    next(error)
  }
})

app.get('/api/players/:id', async(req,res,next)=>{
  try {
    const SQL = `
      SELECT *
      FROM players
      WHERE id = $1
    `;
    const response = await client.query(SQL, [req.params.id])
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/players/:id', async(req,res,next)=> {
  try {
    const SQL = `
      DELETE
      FROM players
      WHERE id = $1
    `;
    const response = await client.query(SQL, [req.params.id])
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})

app.post('/api/players', async(req,res,next)=>{
  try {
    const SQL = `
      INSERT INTO players(name, position, jersey)
      VALUES($1, $2, $3)
      RETURNING *
      `;
      const response = await client.query(SQL, [req.body.name, req.body.position, req.body.jersey])
  } catch (error) {
    next(error)
  }
})

app.put('/api/players/:id', async(req,res,next)=> {
  try {
    const SQL = `
      UPDATE players
      SET name = $1, position = $2, jersey = $3
      WHERE id = $4
      RETURNING *
    `;
    const response = await client.query(SQL, [req.body.name, req.body.position, req.body.jersey, req.params.id])
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})

//Custom 404 route
app.use('*', (req,res,next)=> {
  res.status(404).send('Invalid Route')
})

app.use((err, req, res, next)=> {
  res.status(500).send(err.message)
})

const start = async()=>{
  await client.connect()
  const SQL = `
    DROP TABLE IF EXISTS players;
    CREATE TABLE players(
      id SERIAL PRIMARY KEY,
      name VARCHAR(30),
      position VARCHAR(20),
      jersey INT
    );
    INSERT INTO players (name, position, jersey) VALUES ('Hill', 'WR', 10);
    INSERT INTO players (name, position, jersey) VALUES ('Waddle', 'WR', 17);
    INSERT INTO players (name, position, jersey) VALUES ('Tagovailoa', 'QB', 1);
  `
  await client.query(SQL)
  const PORT = process.env.PORT || 3100
  app.listen(PORT, ()=> {
    console.log('listening on PORT');
  })
}
start()