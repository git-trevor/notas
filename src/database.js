const mongose = require('mongoose');

mongose.connect('mongodb://localhost/notasdb')
    .then(db => console.log('Base de datos conectada'))
    .catch(err => console.log(err));