const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isAuthenticated } = require('../helpers/auth');
const User = require('../model/Users');

router.get('/users/users', isAuthenticated, async function(request, response){
    //response.send('Ingresando a la app');
    // response.render('users/users');  response.render('users/users', {usuarios});
    await User.find()
        .lean()
        .sort({nombre: 'asc'})
        .exec((err, usuarios) => {
            User.countDocuments((err, total) => {
                if(err)
                    return next(err);
                
                response.render('users/users', {usuarios});
            })
        });
        // .then((usuarios) => {
        //     response.render('users/users', {usuarios});
        // })
        // .catch((err) => {
        //     // console.log(err);
        //     response.redirect('/error');
        // });
})

router.get('/users/singin', function(request, response){
    //response.send('Ingresando a la app');
    response.render('users/singin');
})

router.get('/users/singup', function(request, response){
    // response.send('Formulario de autenticación');
    response.render('users/singup');
})

router.get('/users/singupadm', function(request, response){
    // response.send('Formulario de autenticación');
    response.render('users/singupadm');
})

router.post('/users/singup', async function(request, response){
    const {nombre, email, password, confirmpassword} = request.body;
    const errores = [];

    if(!nombre){
        errores.push({text: 'Por favor inserta el nombre'});
    }

    if(!email){
        errores.push({text: 'Por favor inserta el email'});
    }

    if(!password){
        errores.push({text: 'Por favor inserta la contraseña'});
    }

    if(password.length < 4){
        errores.push({text: 'La contraseña debe tener por lo menos 4 caracteres'});
    }

    if(password != confirmpassword){
        errores.push({text: 'La contraseña no coincide'});
    }

    if(errores.length > 0){
        response.render('users/singup', {
            errores,
            nombre,
            email,
            password,
            confirmpassword
        })
    } else{
        // Comprobamos que el usuario no exista en la base de datos con el email
        const emailUser = await User.findOne({email: email});

        if(emailUser){
            errores.push({text: 'El email ya esta en uso, por favor ingrese otro.'});
            response.render('users/singup', {
                errores,
                nombre,
                email,
                password,
                confirmpassword
            });

            return;
        }
        // response.send('Ok');
        const newUser = new User({nombre, email, password, tipo: 1});
        newUser.password = await newUser.encryptPassword(password);
        console.log(newUser);

        // Guardamos el usuario en la base de datos
        await newUser.save()
            .then( () => {
                request.flash('success_msg', 'Usuario registrado correctamente');
                response.redirect('/users/singin');
            })
            .catch((err)=>{
                console.log(err);
                response.redirect('/error');
            })
    }
})

router.post('/users/singupadm', async function(request, response){
    const {nombre, email, password, confirmpassword} = request.body;
    const errores = [];

    if(!nombre){
        errores.push({text: 'Por favor inserta el nombre'});
    }

    if(!email){
        errores.push({text: 'Por favor inserta el email'});
    }

    if(!password){
        errores.push({text: 'Por favor inserta la contraseña'});
    }

    if(password.length < 4){
        errores.push({text: 'La contraseña debe tener por lo menos 4 caracteres'});
    }

    if(password != confirmpassword){
        errores.push({text: 'La contraseña no coincide'});
    }

    if(errores.length > 0){
        response.render('users/singupadm', {
            errores,
            nombre,
            email,
            password,
            confirmpassword
        })
    } else{
        // Comprobamos que el usuario no exista en la base de datos con el email
        const emailUser = await User.findOne({email: email});

        if(emailUser){
            errores.push({text: 'El email ya esta en uso, por favor ingrese otro.'});
            response.render('users/singupadm', {
                errores,
                nombre,
                email,
                password,
                confirmpassword
            });

            return;
        }
        // response.send('Ok');
        const newUser = new User({nombre, email, password, tipo: 1});
        newUser.password = await newUser.encryptPassword(password);
        console.log(newUser);

        // Guardamos el usuario en la base de datos
        await newUser.save()
            .then( () => {
                request.flash('success_msg', 'Usuario registrado correctamente');
                response.redirect('/users/users');
            })
            .catch((err)=>{
                console.log(err);
                response.redirect('/error');
            })
    }
})

router.post('/users/singin', passport.authenticate('local', {
    // Si todo va bien, lo direccionamos a notas
    successRedirect: '/notes',

    // Si hay algún error, lo redireccionamos a signin
    failureRedirect: '/users/singin',

    // Para poder enviar mensajes
    failureFlash: true
}));

// router.get('/users/logout', function(request, response) {
//     request.logout();
//     response.redirect('/');
// })

router.get('/users/logout', (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      // if you're using express-flash
      req.flash('success_msg', 'session terminated');
      res.redirect('/');
    });
  });

module.exports = router;