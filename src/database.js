const mongose = require('mongoose');
require('dotenv').config();

// const url = "mongodb+srv://notas:Notas.2022@cluster0.fl6bxba.mongodb.net/?retryWrites=true&w=majority";
const url = process.env.MONGODB_URL

mongose.connect(url)
    .then(db => console.log('Base de datos conectada'))
    .catch(err => console.log(err));

// mongose.connect('mongodb://localhost/notasdb')
//     .then(db => console.log('Base de datos conectada'))
//     .catch(err => console.log(err));