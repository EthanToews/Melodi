// npm init when ready
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const port = 8080;

app.use(express.urlencoded({extended:true}));
app.use(cookieParser("My secret"));
app.use("/", express.static(__dirname + "/public"));

// Find a way to connect to a Database
app.route("/login")
    .get((req, res) => {
        res.sendFile("login.html", {root: __dirname + "/public"});
    })
    .post((req, res) => {
        res.cookie("UserCookie", req.body.user);
        // res.redirect(`/${req.body.user}/profile`);
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