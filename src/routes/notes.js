const { response } = require('express');
const express = require('express');
const router = express.Router();
const Nota = require('../model/Notes');
const { isAuthenticated } = require('../helpers/auth');
const faker = require('faker');
const Notes = require('../model/Notes');

// Agregar una nota
router.get('/notes/add', isAuthenticated, function(request, response){
    response.render('notes/new-note.hbs');
})

router.get('/notes/search', isAuthenticated, (request, response) => {
    response.render('notes/search-notes');
})

router.post('/notes/search', isAuthenticated, async (request, response) => {
    const search = request.body.search;

    if(search){
        await Notes.find({usuario: request.user._id, $text:{$search: search, $caseSensitive: false}})
            .sort({fecha: 'desc'})
            .exec((err, notas) => {
                console.log(notas);
                response.render('notes/search-notes', {notas, search});
            });
    }
})

// Editar una nota
router.put('/notes/editar-nota/:id', isAuthenticated, async function(request, response){
    const {titulo, descripcion} = request.body;

    await Nota.findByIdAndUpdate(request.params.id, {titulo, descripcion});

    request.flash('success_msg', 'Nota editada de manera exitosa.');
    response.redirect('/notes');
})

router.get('/notes/edit:id', isAuthenticated, async function(request, response){
    try {
        var _id = request.params.id;
        var len = request.params.id.length;

        _id = _id.substring(1, len);

        const nota = await Nota.findById(_id);
        _id = nota._id;
        titulo = nota.titulo;
        descripcion = nota.descripcion;

        response.render('notes/editar-nota', {titulo, descripcion, _id});
    } catch (err) {
        response.send(404);
        response.redirect('/error');
    }
})

// Borrar una nota
router.get('/notes/delete:id', isAuthenticated, async function(request, response){
    try {
        var _id = request.params.id;
        var len = request.params.id.length;

        _id = _id.substring(1, len);

        await Nota.findByIdAndDelete(_id);
        request.flash('success_msg', 'Nota eliminada de manera exitosa.');
        response.redirect('/notes');
    } catch (err) {
        response.send(404);
    }
})

// Obtener todas las notas
router.get('/notes', isAuthenticated, async function(request, response){
    // response.send('Notas de la base de datos');
    await Nota.find({usuario: request.user._id}).lean().sort({fecha: 'desc'})
        .then((notas) => {
            // console.log(notas);
            // response.render('notes/consulta-notas', {notas})
            response.redirect('notes/1');
        })
        .catch((err) => {
            // console.log(err);
            response.redirect('/error');
        });
})

// Ruta para guardar una nota en la BD
router.post('/notes/new-note', isAuthenticated, async function(request, response){
    // Recibimos un request.body que tiene los datos enviados desde el formulario al servidor
    const {titulo, descripcion} = request.body;
    const errores = [];

    if(!titulo)
        errores.push({text: 'Por favor insertar el nombre'});

    if(!descripcion)
        errores.push({text: 'Por favor insertar descripción'});

    if(errores.length > 0) {
        response.render('notes/new-note', {
            errores,
            titulo,
            descripcion
        });
    } else {
        const nuevaNota = new Nota({titulo, descripcion});
        nuevaNota.usuario = request.user._id;
        await nuevaNota.save()  // await guarda la nota en la base de datos de manera asincrona
            .then(() => {
                request.flash('success_msg', 'Nota agregada de manera exitosa.');
                response.redirect('/notes');   // Redirijimos el flujo de la app a la lista de todas las notas
            })
            .catch((err) => {
                console.log(err);
                response.redirect('/error');
            })
        // console.log(nuevaNota);
        // response.send('Ok');
    }
})

router.get('/generate-fake-data', isAuthenticated, async (request, response) => {
    for(let i = 0; i < 30; i++){
        // Tomamos el modelo de la base de datos
        const newNote = new Nota();

        // Agregamos el id del usuario actual
        newNote.usuario = request.user._id;

        // Llenamos el objeto con datos aleatorios
        newNote.titulo = faker.random.word();
        newNote.descripcion = faker.random.words();
        console.log(newNote);

        await newNote.save();
    }

    response.redirect('/notes/');
})

router.get('/notes/:page', isAuthenticated, async (request, response) => {
    // Variable que nos indica cuántas notas por página deseamos
    let perPage = 6;

    // Variable que nos indica qué número de página esta solicitando el usuario, por default se envía la página 1
    let page = request.params.page || 1;

    // Variable que nos indica a partir de cuál nota se mostrará
    let numNota = (perPage * page) - perPage;

    Nota.find({usuario: request.user._id})
        .lean()
        .sort({date: 'desc'})
        .skip(numNota)
        .limit(perPage)
        .exec((err, notas) => {
            Nota.countDocuments({usuario: request.user._id}, (err, total) => {
                if(err)
                    return next(err);
                if(total == 0)  // Si no hay notas en la BD
                    pages = null;
                else
                    pages = Math.ceil(total / perPage);

                response.render('notes/consulta-notas', {
                    notas,
                    current: page,
                    pages: pages
                });
            })
        });
})

module.exports = router;