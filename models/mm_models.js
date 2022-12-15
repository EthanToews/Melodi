const { model, Schema } = require('mongoose')

const MMarrayItemEntrieSchema = new Schema({
  name: { type: String, required: true },
  value: { type: Boolean, required: true } 
})

const MMArrayItemSchema = new Schema({
  entries: {
    type: [MMarrayItemEntrieSchema],
    required: true
  }
})

const MMArraySchema = new Schema({
  items: {
    type: [MMArrayItemSchema],
    required: true
  }
})


const musicMakerSchema = new Schema({
  title: String,
  ownerId: {
    type: String,
    required: true
  },
  musicArray: {
    type: MMArraySchema,
    required: true
  },
  entryLastUpdated: MMarrayItemEntrieSchema
}, { timestamps: true })

const MMArrayModel = model('MMArray', MMArraySchema)
const MMModel = model('MusicMaker', musicMakerSchema)

const defaultMMArray = new MMArrayModel({
  items: [
    {
      entries: [
        { name: 'a1', value: false },
        { name: 'a2', value: false },
        { name: 'a3', value: false },
        { name: 'a4', value: false },
        { name: 'a5', value: false },
        { name: 'a6', value: false },
        { name: 'a7', value: false },
        { name: 'a8', value: false }
      ]
    },
    {
      entries: [
        { name: 'b1', value: false },
        { name: 'b2', value: false },
        { name: 'b3', value: false },
        { name: 'b4', value: false },
        { name: 'b5', value: false },
        { name: 'b6', value: false },
        { name: 'b7', value: false },
        { name: 'b8', value: false }
      ]
    },
    {
      entries: [
        { name: 'c1', value: false },
        { name: 'c2', value: false },
        { name: 'c3', value: false },
        { name: 'c4', value: false },
        { name: 'c5', value: false },
        { name: 'c6', value: false },
        { name: 'c7', value: false },
        { name: 'c8', value: false }
      ]
    },
    {
      entries: [
        { name: 'd1', value: false },
        { name: 'd2', value: false },
        { name: 'd3', value: false },
        { name: 'd4', value: false },
        { name: 'd5', value: false },
        { name: 'd6', value: false },
        { name: 'd7', value: false },
        { name: 'd8', value: false }
      ]
    },
    {
      entries: [
        { name: 'e1', value: false },
        { name: 'e2', value: false },
        { name: 'e3', value: false },
        { name: 'e4', value: false },
        { name: 'e5', value: false },
        { name: 'e6', value: false },
        { name: 'e7', value: false },
        { name: 'e8', value: false }
      ]
    },
    {
      entries: [
        { name: 'f1', value: false },
        { name: 'f2', value: false },
        { name: 'f3', value: false },
        { name: 'f4', value: false },
        { name: 'f5', value: false },
        { name: 'f6', value: false },
        { name: 'f7', value: false },
        { name: 'f8', value: false }
      ]
    },
    {
      entries: [
        { name: 'g1', value: false },
        { name: 'g2', value: false },
        { name: 'g3', value: false },
        { name: 'g4', value: false },
        { name: 'g5', value: false },
        { name: 'g6', value: false },
        { name: 'g7', value: false },
        { name: 'g8', value: false }
      ]
    },
    {    
      entries: [
        { name: 'h1', value: false },
        { name: 'h2', value: false },
        { name: 'h3', value: false },
        { name: 'h4', value: false },
        { name: 'h5', value: false },
        { name: 'h6', value: false },
        { name: 'h7', value: false },
        { name: 'h8', value: false }
      ]
    }
  ]
})

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  musicMaker: musicMakerSchema
}, { timestamps: true })

const UserModel = model('User', userSchema)

module.exports = {
  MMModel,
  UserModel,
  defaultMMArray,
  musicMakerSchema
}
