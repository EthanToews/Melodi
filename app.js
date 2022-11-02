/*
ACS-3909-050 Adv. Internet Programming
Final Project
David Renz
Ethan Toews
Ben Joshua Guina
*/
const mongodb = require('mongodb')
const nunjucks = require('nunjucks')
const express = require('express')
const expressWS = require('express-ws')
// For some fun ASCII in the terminal
const figlet = require('figlet')

const app = express()
const port = '3000'

nunjucks.configure('views', {
  express: app,
  noCache: true
})

//register websocket
const ws_app = expressWS(app)

//setting up mongodb uris
const uri = 'mongodb+srv://acs:ayEWLtGFS1ZlWOmO@express.ngknjvs.mongodb.net/?retryWrites=true&w=majority'
const client = new mongodb.MongoClient(uri)

// const gridValues = [
//   "a1": false, "a2": false, "a3": false, "a4": false, "a5": false, "a6": false, "a7": false, "a8": false,
//   "b1": false, "b2": false, "b3": false, "b4": false, "b5": false, "b6": false, "b7": false, "b8": false,
//   "c1": false, "c2": false, "c3": false, "c4": false, "c5": false, "c6": false, "c7": false, "c8": false,
//   "d1": false, "d2": false, "d3": false, "d4": false, "d5": false, "d6": false, "d7": false, "d8": false,
//   "e1": false, "e2": false, "e3": false, "e4": false, "e5": false, "e6": false, "e7": false, "e8": false,
//   "f1": false, "f2": false, "f3": false, "f4": false, "f5": false, "f6": false, "f7": false, "f8": false,
//   "g1": false, "g2": false, "g3": false, "g4": false, "g5": false, "g6": false, "g7": false, "g8": false,
//   "h1": false, "h2": false, "h3": false, "h4": false, "h5": false, "h6": false, "h7": false, "h8": false
//   [{"name": "b1", "value": false},{"name": "b2", "value": false},{"name": "b3", "value": false},{"name": "b4", "value": false},{"name": "b5", "value": false},{"name": "b6", "value": false},{"name": "b7", "value": false},{"name": "b8", "value": false}],
//   [{"name": "c1", "value": false},{"name": "c2", "value": false},{"name": "c3", "value": false},{"name": "c4", "value": false},{"name": "c5", "value": false},{"name": "c6", "value": false},{"name": "c7", "value": false},{"name": "c8", "value": false}],
//   [{"name": "d1", "value": false},{"name": "d2", "value": false},{"name": "d3", "value": false},{"name": "d4", "value": false},{"name": "d5", "value": false},{"name": "d6", "value": false},{"name": "d7", "value": false},{"name": "d8", "value": false}],
//   [{"name": "e1", "value": false},{"name": "e2", "value": false},{"name": "e3", "value": false},{"name": "e4", "value": false},{"name": "e5", "value": false},{"name": "e6", "value": false},{"name": "e7", "value": false},{"name": "e8", "value": false}],
//   [{"name": "f1", "value": false},{"name": "f2", "value": false},{"name": "f3", "value": false},{"name": "f4", "value": false},{"name": "f5", "value": false},{"name": "f6", "value": false},{"name": "f7", "value": false},{"name": "f8", "value": false}],
//   [{"name": "g1", "value": false},{"name": "g2", "value": false},{"name": "g3", "value": false},{"name": "g4", "value": false},{"name": "g5", "value": false},{"name": "g6", "value": false},{"name": "g7", "value": false},{"name": "g8", "value": false}],
//   [{"name": "h1", "value": false},{"name": "h2", "value": false},{"name": "h3", "value": false},{"name": "h4", "value": false},{"name": "h5", "value": false},{"name": "h6", "value": false},{"name": "h7", "value": false},{"name": "h8", "value": false}]
// ]

app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

app.get('/end-point', (req, res) => {
  console.log('Hello World')
  res.end()
})

async function watchDB() {
  await client.connect();
  const col = client.db('express').collection('makerEntries');
  return col.watch({fullDocument: 'updateLookup'})
}

app.ws('/update-entry', async (ws, res) => {
  console.log('Web socket opened')
  await client.connect();
  const col = client.db('express').collection('makerEntries');
  const aWss = ws_app.getWss('/update-entry');

  //handle variable update from client
  ws.on('message', async (msg) => {
    console.log('Recived from browser', msg);
    const parsedMSG = JSON.parse(msg)
    const value = { [parsedMSG.name]: parsedMSG.value }
    const updateDoc = {
      $set: value
    }
    //console.log('Update doc: ', updateDoc)
    const queryDoc = {
      [JSON.parse(msg).name]: {"$exists": true}
    }
    const result = await col.findOneAndUpdate(
      queryDoc,
      updateDoc,
      { upsert: true }
    )
    //console.log('Updated MongoDB', result);
  })

  // Relay update from MongoDB
  watchDB().then((stream) => {
    stream.on('change', changeEvent => {
      //console.log("MongoDB has changed ", changeEvent)
      aWss.clients.forEach(client => {
        let response = changeEvent.updateDescription.updatedFields
        client.send(JSON.stringify(response));
      });
    })
  })
});

app.get('/beat-maker', async (req, res) => {
  console.log('connecting...')
  await client.connect().catch((err) => console.log(err))
  console.log('DB connected')
  const col = client.db('express').collection('makerEntries')
  let cursor = col.find({});
  let values = await cursor.toArray();
  delete values[0]._id
  const entries = values[0]
  const gridValues = []
  for (const property in entries) {
    gridValues.push({name: property, value: entries[property]})
  }

  const newGridValues = []
  while(gridValues.length) newGridValues.push(gridValues.splice(0,8));

  res.render('beat-maker.njk',
  { gridValues: newGridValues })
})

app.get('*', (req, res) => {
  res.send('sorry 404 :(', 404);
});

app.listen(port, () => {
  figlet('Melodi', (err, data) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('----------------------------------')
    console.log(data)
    console.log('----------------------------------')
    console.log('By: David, Ben, and Ethan')
    console.log('Server is running at http://localhost:' + port)
  })
})