//import express from 'express'
const express= require("express")

const app = express()
app.get ('/', (request,response) => {
    
    response.send("entramos a la función principal")
})


app.get('/personas', (req, res) => {
  const edad=req.query.edad
  const nombre=req.query.nombre
  const apellido=req.query.apellido

  console.log(edad)
  console.log(nombre)
  console.log(apellido)


  res.send('Hello World')
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})


