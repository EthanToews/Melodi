// npm init when ready
const express = require("express");
const expressWS = require('express-ws')
const nunjucks = require('nunjucks')
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require('mongodb');

//some cool startup stuff
const figlet = require('figlet')

const app = express();
const port = 8080;

//mongodb uri, unsafe but I think prof mentioned learning about hiding this stuff later on. 
const uri = "mongodb+srv://acs:ayEWLtGFS1ZlWOmO@express.ngknjvs.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

nunjucks.configure('views', {
    express: app,
    noCache: true
  })
  
//register websocket
const ws_app = expressWS(app)

app.use(express.urlencoded({extended:true}));
app.use( express.json() );
app.use(cookieParser("My secret"));
app.use("/", express.static(__dirname + "/public"));

app.route('/profile_page')
    .get((req, res) => {
        res.sendFile("profile_page.html", {root: __dirname + "/public"});
    })
    
app.route("/signup")
    .get((req, res) => {
        res.sendFile("sign_Up.html", {root: __dirname + "/public"});
    })
    .post((req, res) => {
        const username = req.body.username.toLowerCase();
        const password = req.body.password;
        
        const insertUsername = async function() {
            const insert = await client.connect();
            const collection =  insert.db("melodi").collection("users");
            const insertUser = await collection.insertOne( {username: username, password: password });
            if(insertUser['acknowledged']) {
                res.cookie("UserCookie", req.body.username);
                res.redirect("/login");
            } else {
                res.status(500);
                res.end();
            }
        }
        insertUsername();          
    })
// Find a way to connect to a Database
app.route("/login")
    .get((req, res) => {
        res.sendFile("login.html", {root: __dirname + "/public"});
    })
    .post(async (req, res) => {
        const username = req.body.username.toLowerCase();
        
        const findUsername = async function() {
            const find = await client.connect();
            const collection =  find.db("melodi").collection("users");
            const findUser = await collection.findOne( { username: username });
            console.log(findUser);
            if(findUser) {
                res.cookie("UserCookie", username);
                const response = {status: 200, response: "Logged In!", username};
                res.json(response);
            } else {
                const response = {status: 404, response: "Username not found please try again."};
                res.json(response);
            }
        }
        await findUsername();
    });

app.get("/logout", (req, res) => {
    res.clearCookie("UserCookie");
    res.redirect("/login");
});

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