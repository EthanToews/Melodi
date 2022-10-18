/*
ACS-3909-050 Adv. Internet Programming
Final Project
David Renz
Ethan Toews
Ben Joshua Guina
*/
const express = require('express')
const expressWS = require('express-ws')

const app = express()
const port = '3000'

const ws_app = expressWS(app)

app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

app.get('/end-point', (req, res) => {
  console.log('Hello World')
  res.end()
})

app.listen(port, () => {
  console.log('Server is running at http://localhost:' + port)
})