const express = require('express')
const passport = require('passport')
const dotenv = require('dotenv')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('express-flash')
// .env setup
dotenv.config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Create a router container
const router = express.Router();

// importing User Schema
const User = require('./models/user')

// cookie parser
router.use(cookieParser('cats'))

// set session
router.use(session({
    secret: 'top secret',
    resave: false,
    saveUninitialized: true
}));

// express-flash
router.use(flash());

// initialize the passport
router.use(passport.initialize());
router.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

// home page
router.get('/', (req, res) => {
    console.log('req.user', req.user)
    res.render('index.html', {
        title: 'Hello World',
        user: req.user
    })
})

// register page
router.get('/register', (req, res) => {
    res.render('register.html');    
});

// email verification page
router.get('/email-verification', (req, res) => {
    res.render('email-verification.html', {
        title: 'Email verification sent!'
    });
})

// register function
router.post('/register', (req, res) => {
    User.register(new User ({
        email: req.body.email
    }), req.body.password, function (err, user) {
        if (err) {
            return res.render('register.html', {
                info: "Sorry, Email already exists. Try again."});
        }
        var authenticationURL = 'http://localhost:5000/verify?authToken=' + user.authToken;
        sgMail.send({
            to:       user.email,
            from:     'yifengjin68@gmail.com',
            subject:  'Confirm your email',
            html:     '<a target=_blank href=\"' + authenticationURL + '\">Confirm your email</a>'
            }, function(err, json) {
            if (err) { return console.error(err); }
            console.log('sent email')
            res.redirect('/email-verification');
        });
    });
});

// verify page
router.get('/verify', (req, res) => {
    User.verifyEmail(req.query.authToken, function (err, existingAuthToken) {
        if (err) {
            console.log('err', err);
        } else {
            res.render('email-verification.html', {
                title: 'Email verified successfully!'
            });
        }
    });
});   

// login page
router.get('/login', (req, res) => {
    res.render('login.html');
});

// unauthorized function
router.get('/unauthorized', (req, res) => {
    res.render('index.html', {
        info: "Unauthorized"
    });
});

// TODO: login function
router.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user) {
      if (err) {
        req.flash("error", err.message);
        return next(err);
      }
      if (!user) {
        req.flash("error", "Login failed");
        console.log('not user')
        // If login failed, we still need the original URL, so retrive from req.session
        return res.redirect('/login');
      }
      req.logIn(user, function (err) {
        if (err) {
          req.flash("error", err.message);
          return next(err);
        }
        req.flash("success", "Login Successful!");
        res.redirect('/');
      });
    })(req, res, next);
  });


// logout function
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


// export module
module.exports = router