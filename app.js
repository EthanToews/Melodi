// npm init when ready
const express = require("express");
const expressWS = require('express-ws');
const session = require("express-session");
const nunjucks = require('nunjucks');
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const {MONGODB, SESSION} = require('./credentials');

const { MongoClient, ServerApiVersion } = require('mongodb');

//some cool startup stuff
const figlet = require('figlet')

const app = express();
const port = 8080;

const uri = `mongodb+srv://${MONGODB.user}:${MONGODB.login}@${MONGODB.cluster}/${MONGODB.db}?retryWrites=true&w=majority`;

module.exports = {
  uri: uri,
}
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

nunjucks.configure('views', {
    express: app,
    noCache: true
  })
  // Cookie middleware
  app.use(session({
    secret: SESSION.secret
  }));

//register websocket
const ws_app = expressWS(app)

app.use(express.urlencoded({extended:true}));
app.use( express.json() );
app.use(cookieParser("My secret"));
app.use("/", express.static(__dirname + "/public"));
// to get the sounds
app.use("/sounds", express.static("sounds"));

const user_routes = require("./routes/user_routes.js");
app.use("/user", user_routes);

app.route('/profile_page')
    .get((req, res) => {
        res.sendFile("profile_page.html", {root: __dirname + "/public"});
    })
 


async function watchDB() {
    await client.connect();
    const col = client.db('melodi').collection('makerEntries');
    return col.watch({fullDocument: 'updateLookup'})
  }

app.ws('/update-entry', async (ws, res) => {
    console.log('Web socket opened')
    await client.connect();
    const col = client.db('melodi').collection('makerEntries');
    const aWss = ws_app.getWss('/update-entry');
  
    //handle variable update from client
    ws.on('message', async (msg) => {
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
    const col = client.db('melodi').collection('makerEntries')
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

app.get('/download-file', async (req, res) => {
  console.log('connecting...')
  await client.connect().catch((err) => console.log(err))
  console.log('DB connected')
  const col = client.db('melodi').collection('makerEntries')
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

  res.json(newGridValues);
})

// Custom 404 & 500
app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/public/404.html");
});

app.use((req, res) => {
    res.status(500).sendFile(__dirname + "/public/500.html");
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