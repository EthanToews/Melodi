/*
ACS-3909-050 Adv. Internet Programming
Final Project
David Renz
Ethan Toews
Ben Joshua Guina
*/
const express = require('express')
const expressWS = require('express-ws')
// For some fun ASCII in the terminal
const figlet = require('figlet')

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