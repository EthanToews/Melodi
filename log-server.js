// npm init when ready
const express = require("express");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 8080;

//mongodb uri, unsafe but I think prof mentioned learning about hiding this stuff later on. 
const uri = "mongodb+srv://Melodi:Melodi123@melodi.pvzwu0d.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.use(express.urlencoded({extended:true}));
app.use( express.json() );
app.use(cookieParser("My secret"));
app.use("/", express.static(__dirname + "/public"));

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
    .post((req, res) => {
        const username = req.body.username.toLowerCase();
        
            const findUsername = async function() {
            const find = await client.connect();
            const collection =  find.db("melodi").collection("users");
            const findUser = await collection.findOne( { username: username });
            console.log(findUser);
            if(findUser) {
                res.cookie("UserCookie", username);
                res.redirect("/");
            } else {
                const response = {response: "Username not found please try again."};
                console.log(response);
                res.json(response);
            }
        }
        findUsername();
    });

app.get("/logout", (req, res) => {
    res.clearCookie("UserCookie");
    res.redirect("/login");
});

// Custom 404 & 500
app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/public/404.html");
});

app.use((req, res) => {
    res.status(500).sendFile(__dirname + "/public/500.html");
});

app.listen(port, () => {
    console.log("Listening...")
});