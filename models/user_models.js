const mongoose = require("mongoose");
const hash = require("pbkdf2-password")();
const{MONGODB} = require("../credentials");
const uri = `mongodb+srv://${MONGODB.user}:${MONGODB.login}@${MONGODB.cluster}/${MONGODB.db}?retryWrites=true&w=majority`;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    hash: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true
    }
}, {
    statics: {
        authenticate(username,pw,cb) {
            console.log("reached");
            this.findOne({username: username}, function(err, doc) {
                
                if (doc) {
                    console.log("Found entry")
                    console.log("Salt: ", doc.salt);
                    hash({password: pw, salt: doc.salt}, function(err, pass, salt, hash) {
                        if (err) return err;
                        if (hash === doc.hash) {
                            return cb(username);

                        } else {
                            console.log("pw did not match");
                            return cb(null);
                        }
                    })
                }
            })
        }
        
    }
})

const User = mongoose.model("user", userSchema);

async function insertUser(uri, user) {

    // Create hashed pw
    let newUser = new User({
        username: user.name,
        hash: "",
        salt: ""
    });

    hash({password: user.password}, (err, pass, salt, hashed) => {
        if (err) throw err;
        newUser.hash = hashed;
        newUser.salt = salt;
    });

    await mongoose.connect(uri).catch(console.log);

    return result = await newUser.save();
    
}

module.exports = {
    User: User,
    insertUser: insertUser
};