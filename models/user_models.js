const mongoose = require("mongoose");
const hash = require("pbkdf2-password")();
const{MONGODB} = require("../credentials");
const { defaultMMArray, musicMakerSchema } = require('./mm_models');
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
    },
    musicMaker: musicMakerSchema
}, {
    statics: {
        async authenticate(username,pw,cb) {
            console.log("reached");
            await mongoose.connect(uri);
            this.findOne({username: username}, function(err, doc) {
                if (doc) {
                    console.log("Found entry")
                    console.log("Salt: ", doc.salt);
                    hash({password: pw, salt: doc.salt}, function(err, pass, salt, hash) {
                        if (err) return err;
                        if (hash === doc.hash) {
                            return cb(username, doc._id);

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
        salt: "",
    });

    hash({password: user.password}, (err, pass, salt, hashed) => {
        if (err) throw err;
        newUser.hash = hashed;
        newUser.salt = salt;
    });

    await mongoose.connect(uri).catch(console.log);

    const savedUser = await newUser.save();
    const defaultMM = {
        title: 'Track',
        ownerId: savedUser._id,
        musicArray: defaultMMArray
    }
    savedUser.musicMaker = defaultMM
    return fullUser = await User.findOneAndUpdate(
        { _id: savedUser._id },
        { ...savedUser },
        { new: true } 
    )
}

module.exports = {
    User: User,
    insertUser: insertUser
};