const express = require('express'); // Servidor web
const path = require('path');   // Rutas de la aplicación
const { engine } = require('express-handlebars');   // Handlebars
const methodOverride = require('method-override');  // Métodos sobre-escritos
const session = require('express-session'); // Módulo de sesiones
const flash = require('connect-flash');  // Librería para mensajes
const passport = require('passport');
const { initialize } = require('passport');

// Inicializaciones
const app = express();
require('./database');
require('./config/passport');

// Configuraciones
app.set('puerto', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
        defaultLayout: 'main',
        defaultDir: path.join('views', 'layouts'),
        partialsDir: path.join(__dirname, 'views', 'partials'),
        extname: 'hbs',
        runtimeOptions: {
            allowProtoMethodsByDefault: true,
            allowProtoPropertiesByDefault: true
        },
        helpers: {
            equal: function(lvalue, rvalue, options) {
                if(lvalue != rvalue)
                    return options.inverse(this);
                else
                    return options.fn(this);
            },
            for: function(current, pages, options) {
                current: Number(current);
                pages: Number(pages);
    
                var code = '';
    
                // Inicializamos la variable i con la paginación inicial
                // Si i > 3 le restamos 2 y si no es mayor a 3 la inicializamos en 1
                var i = current > 3 ? current - 2 : 1;
    
                // Si el indice i es mayor a 1 es porque queremos renderizar solo algunas páginas
                if(i !== 1){
                    let last = i - 1;
    
                    code += '<li class="page-item mr-1">'
                        + '<a href="/notes/' + last + '" class="page-link">...</a>'
                        + '</li>'
                }
    
                for(; i < (current + 3) && i <= pages; ++i){
                    if(i == current){
                        code += '<li class="page-item active mr-1">'
                            + '<a href="' + i + '" class="page-link">' + i + '</a>'
                            + '</li>'
                    } else {
                        code += '<li class="page-item mr-1">'
                            + '<a href="/notes/' + i +'" class="page-link">' + i + '</a>'
                            + '</li>'
                    }
    
                    // Si hay más páginas que mostrar incluimos después del for
                    // puntos suspensivos para indicar que hay más páginas antes del final
                    if(i == (current + 2) && i < pages){
                        let last = i + 1;
    
                        code += '<li class="page-item mr-1">'
                            + '<a href="/notes/' + last +'" class="page-link">...</a>'
                            + '</li>'
                    }
                }
    
                return options.fn(code);
            }
        }
    },)
);
app.set('view engine', 'hbs');

// Middleware
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(session({
        secret: 'midna',
        resave: true,
        saveUninitialized: true
    }
));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Variables globales
app.use(function(request, response, next){
    response.locals.success_msg = request.flash('success_msg');
    response.locals.error_msg = request.flash('error_msg');
    response.locals.error = request.flash('error');
    response.locals.usuario = request.user || null;

    next();
})

// Rutas
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Servidor
app.listen(app.get('puerto'), function(){
    console.log('Servidor corriendo en el puerto: ' + app.get('puerto'));
});