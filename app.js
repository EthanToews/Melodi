// npm init when ready
const express = require("express");
const expressWS = require('express-ws');
const nunjucks = require('nunjucks');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const { MMModel, UserModel, defaultMMArray } = require('./models/mm_models');
const {MONGODB, SESSION} = require('./credentials');

//some cool startup stuff
const figlet = require('figlet');

const app = express();
const port = 8080;

const uri = `mongodb+srv://${MONGODB.user}:${MONGODB.login}@${MONGODB.cluster}/${MONGODB.db}?retryWrites=true&w=majority`;

module.exports = {
  uri: uri,
}
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

let userID = ''

nunjucks.configure('views', {
    express: app,
    noCache: true
  })
  
//register websocket
const ws_app = expressWS(app)

app.use(session({
  secret: SESSION.secret
}));

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
        const see = new URLSearchParams(req.query)
        if (see.get('id')) {
          userID = see.get('id')
        }
        res.sendFile("profile_page.html", {root: __dirname + "/public"});
    })
 
// app.route("/signup")
//     .get((req, res) => {
//         res.sendFile("sign_Up.html", {root: __dirname + "/public"});
//     })
//     .post((req, res) => {
//         mongoose.connect(uri, { useNewUrlParser: true })
//         const newUser = new UserModel({
//           username: req.body.username.toLowerCase(),
//           password: req.body.password
//         })
        
//         const insertUsername = async function() {
//           const savedUser = await newUser.save()
//           const defaultMM = {
//             title: 'Track',
//             ownerId: savedUser._id,
//             musicArray: defaultMMArray
//           }
//           savedUser.musicMaker = defaultMM
//           const fullUser = await UserModel.findOneAndUpdate(
//             { _id: savedUser._id },
//             { ...savedUser },
//             { new: true } 
//           )
//           if(fullUser) {
//             userID = savedUser._id
//             res.cookie("UserCookie", req.body.username);
//             res.redirect("/login");
//           } else {
//             res.status(500);
//             res.end();
//           }
//         }
//         insertUsername();          
//     })
// // Find a way to connect to a Database
// app.route("/login")
//     .get((req, res) => {
//         res.sendFile("login.html", {root: __dirname + "/public"});
//     })
//     .post(async (req, res) => {
//         const username = req.body.username.toLowerCase();
//         const password = req.body.password;

//         const findUsername = async function() {
//             mongoose.connect(uri, { useNewUrlParser: true })
//             const findUser = await UserModel.findOne( { username, password });
//             if(findUser) {
//                 userID = findUser._id
//                 res.cookie("UserCookie", username);
//                 const response = {status: 200, response: "Logged In!", username};
//                 res.json(response);
//             } else {
//                 const response = {status: 404, response: "Username not found please try again."};
//                 res.json(response);
//             }
//         }
//         await findUsername();
//     });

app.get("/logout", (req, res) => {
    userID = ''
    res.clearCookie("UserCookie");
    req.session.destroy()
    res.redirect("/user/login")
});

async function watchDB() {
  mongoose.connect(uri, { useNewUrlParser: true })
  return UserModel.watch({ userId: userID })
}

app.ws('/update-entry', async (ws, res) => {
    console.log('Web socket opened')
    mongoose.connect(uri, { useNewUrlParser: true })
    const aWss = ws_app.getWss('/update-entry');
  
    //handle variable update from client
    ws.on('message', async (msg) => {
      if (userID) {
        const findUser = await UserModel.findById(userID)
        const parsedMSG = JSON.parse(msg)
        let lastUpdated = null
        const updatedMusicArray = findUser.musicMaker.musicArray.items.map(element => {
          const entries = element.entries.map(entry => {
            let temp = entry
            if (entry.name === parsedMSG.name) {
              temp.value = parsedMSG.value
              lastUpdated = temp
            }
            return temp
          });
          return { entries }
        });
        await UserModel.findByIdAndUpdate(userID, {
          musicMaker: {
            title: 'Track',
            ownerId: userID,
            musicArray: { items: updatedMusicArray },
            entryLastUpdated: lastUpdated
          }
        })
      }
    })
    
    // Relay update from MongoDB
    watchDB().then((stream) => {
      stream.on('change', changeEvent => {
        aWss.clients.forEach(client => {
          let response = changeEvent.updateDescription.updatedFields
          client.send(JSON.stringify(response));
        });
      })
    })
  });

app.get('/beat-maker', async (req, res) => {
    mongoose.connect(uri, { useNewUrlParser: true} )
    const findUser = await UserModel.findById(userID)
    const entries = findUser.musicMaker.musicArray.items
    res.render('beat-maker.njk',
    { gridValues: entries })
  })

app.get('/explore', async (req, res) => {
    mongoose.connect(uri, { useNewUrlParser: true} )
    const melodi = await MMModel.find({})
    const entries = melodi
    res.render('explore.njk',
    { melodis: entries })
  })

app.get('/download-file', async (req, res) => {
  mongoose.connect(uri, { useNewUrlParser: true} )
  const findUser = await UserModel.findById(userID)
  const entries = findUser.musicMaker.musicArray.items

  res.json(entries);
})

app.post('/upload-melodi', async (req, res) => {
  let title = req.body.name
  if(!title) {
    title = "Track"
  }
  mongoose.connect(uri, { useNewUrlParser: true} )
  const findUser = await UserModel.findById(userID)
  const musicMaker = new MMModel({
      title: title,
      ownerId: findUser._id,
      musicArray: findUser.musicMaker.musicArray
    })
  const doc = await musicMaker.save()
  if(doc) {
    const response = {status: 200, response: doc};
    res.json(response);
  } else {
    const response = {status: 404, response: "Unable to upload melodi"};
    res.json(response);
  }
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