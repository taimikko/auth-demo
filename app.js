const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const app = express();

const User = require('./models/user');

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


// PASSPORT START ------------------------------------------------------------

// Authenticating requests is simple as calling passport.authenticate() and
// specifying which strategy to employ.

// Strategies MUST BE CONFIGURED prior using them in a route!

// 3 pieces need to be configured to use Passport for authentication:

// 1. Authentication strategies
// 2. Application middleware
// 3. Sessions (optional)

// Strategies, and their configuration, are supplied via the use() function.
// For example, the following uses the LocalStrategy for username/password
// authentication.
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) return done(err);
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
}));

// In a typical web app, the credentials used to authenticate a user will only
// be transmitted during the login request. If authentication succeeds,
// a session will be established and maintained via a cookie set in
// the user's browser.
// So each subsequent request will not contain credentials, but rather the
// unique cookie that identifies the session.

// Note that enabling session support is entirely optional, though it's
// recommended for most applications. If enabled, be sure to use session()
// before passport.session() to ensure that the login session is restored
// in the correct order!
app.use(session({ secret: 'cats' }));

// In a Express-based app, passport.initialize() middleware is required to
// initialize Passport.
app.use(passport.initialize());

// If your application uses persistent login sessions, passport.session()
// middleware must also be used.
app.use(passport.session());

// In order to support login sessions, Passport will serialize and deserialize
// user instances to and from the session.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
});
// PASSPORT END --------------------------------------------------------------


// Simple middleware to pass in info to views about user's authentication status.
app.use((req, res, next) => {
  res.locals.authenticated = req.user;
  next();
});


// index  --------------------------------------------------------------------
app.get('/', (req, res) => {
  res.render('index');
});


// Log In --------------------------------------------------------------------
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login', failureFlash: false })
);


// Log Out -------------------------------------------------------------------
app.get('/logout', (req, res) => {
  // Passport exposes a logout() function on req that can be called from any
  // route handler which needs to terminate a login session. Invoking logout()
  // will remote the req.user property and clear the login session (if any).
  req.logout();
  res.redirect('/');
});


// Sign Up -------------------------------------------------------------------
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    User.create({
      username,
      password
    }).then(user => {
      console.log(user);
    }, err => {
      console.error('err');
    });
  }
  // In every case just redirect back to home page
  return res.redirect('/');
});


// Le Secret ------------------------------------------------------------------
app.get('/secret', ensureLoggedIn('/login'),  (req, res) => {
  res.render('secret');
});


app.listen(3000, () => console.log('Listening on port 3000...'));
