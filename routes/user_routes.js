const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const {User, insertUser} = require("../models/user_models");
const {uri} = require("../app");

// Middleware specific to this router
// Load Model

router.use((req, res, next) => {
    req.model = User;
    next();
});

//Login
router.get("/login", (req, res) => {
    res.render("login.njk", {});

});

router.post("/login", (req, res) => {
    req.model.authenticate(req.body.username, req.body.password, function(username, id) {
        if (username) {
            console.log("Authenticated", username);
            req.session.regenerate(function () {
                req.session.user = username;
                // Retrieve info from session storage
                mongoose.connect(uri, { useNewUrlParser: true })
                console.log("success");
                res.redirect(`../profile_page?id=${id}`);
            });
        } else {
            console.log("failed");
            res.redirect("/user/login");
    
        }
    });

 
});

router.route("/signup")
    .get((req, res) => {
        res.render("signup.njk", {root: __dirname + "/public"});
    })
    .post((req, res) => {
        const username = req.body.username.toLowerCase();
        const password = req.body.password;

        const user = {
          name: username,
          password: password,
        }
        
        insertUser(uri, user).then(console.log);

        res.redirect("/user/login");
    })

// export
module.exports = router;