const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../model/Users');

passport.use(new LocalStrategy(
    {
        usernameField: 'email'
    },
    // done será la variable donde regresemos la info de la autenticación
    async function(email, password, done){
        const usuario = await Usuario.findOne({email: email});

        if(!usuario) {
            // null indica que no hay error || false indica que no se encontro el usuario en la BD
            return done(null, false, {message: 'No se encontro el usuario'});
        } else {
            const coincide = await usuario.matchPassword(password);

            if(coincide) {
                // null indica que no hay error || user indica que encontro un usuario con el email proporcionado en la BD y que coincide con el password
                return done(null, usuario);
            } else {
                // Contraseña incorrecta
                return done(null, false, {message: 'Contraseña incorrecta'})
            }
        }
    }
));

passport.serializeUser(function(usuario, done) {
    done(null, usuario.id);
});

passport.deserializeUser(function(id, done) {
    Usuario.findById(id, function(error, usuario) {
        done(error, usuario);
    })
});