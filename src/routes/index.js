const express = require('express');
const router = express.Router();

router.get('/', function(request, response){
    // response.send('Index');
    response.render('index');
})

router.get('/about', function(request, response){
    // response.send('Acerca de...');
    response.render('about');
})

module.exports = router;