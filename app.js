const express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    passportJWT = require('passport-jwt'),
    JWTStrategy = passportJWT.Strategy,
    bodyParser = require('body-parser'),
    bcrypt = require('bcrypt'),
    cookies = require('cookie-parser'),
    firebase = require('firebase'),
    flash = require('connect-flash'),
    serviceAccount = require('./serviceAccountKey.json');


User = require('./schema/User');

/* Start */
const app = express();
app.use(flash());
app.use(cookies());
require('dotenv').config();

//Session just for req.flash
app.use(require('express-session')({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(function (req, res, next) {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

/* Routes */
const indexRouter = require('./routes/index'), usersRouter = require('./routes/auth');

/* View Engine settings */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);

/* CONNECT to DB */
const databaseUri = process.env.MONGODB_URI || 'mongodb://localhost/strv';

mongoose.connect(databaseUri, {useNewUrlParser: true})
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));

/* Passport settings */
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const userDocument = await User.findOne({email: email}).exec();
        const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);

        if (passwordsMatch) {
            return done(null, userDocument);
        } else {
            return done('Incorrect Email / Password');
        }
    } catch (error) {
        done(error);
    }
}));

passport.use(new JWTStrategy({
        jwtFromRequest: req => req.cookies['jwt'],
        secretOrKey: process.env.SECRET,
    },
    (jwtPayload, done) => {
        if (Date.now() > jwtPayload.expires) {
            return done('jwt expired');
        }
        return done(null, jwtPayload);
    }
));

/* Firebase  */
config = {
    apiKey: "AIzaSyAxYkr7gGDEzcZVt3bb-gkQtrAC9G236hI",
    authDomain: "strv-20b17.firebaseapp.com",
    databaseURL: "https://strv-20b17.firebaseio.com",
    projectId: "strv-20b17",
    storageBucket: "strv-20b17.appspot.com",
    messagingSenderId: "935315988614"
};
firebase.initializeApp(config);

/* Body-Parser settings */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.listen(process.env.PORT || 4000, () => {
    console.log('Server has started on port ' + process.env.PORT);
});

module.exports = app;
