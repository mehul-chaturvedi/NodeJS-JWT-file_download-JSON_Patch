var express = require('express');
var authController = require('./authController');
var db = require('./db');
var port = process.env.PORT || 5000;
var app = express();


app.listen(port, ()=>{
    console.log('server started at ', port);
})


app.get('/', ()=>{
    console.log('api works')
})
app.use('/auth', authController);



module.exports = app;