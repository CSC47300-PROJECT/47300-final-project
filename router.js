const express = require('express')
const passport = require('passport')
const dotenv = require('dotenv')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
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
    name: 'name of keyboard cat',
    secret: 'top secret',
    resave: false,
    saveUninitialized: false,
}));

// express-flash
router.use(flash());

// initialize the passport
router.use(passport.initialize());
router.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

// flash message, currentUser middleware
router.use((req, res, next) => {
  res.locals.currentUser = req.user
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }
  next()
});

// home page
router.get('/', (req, res) => {
    console.log('req.user', req.user)
    res.render('index.html', {
        title: 'Hello World'
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
            subject:  'Confirm 47300 OnlineShopping Mall email',
            html:     '<h3>Thank you for registering with us! <a target=_blank href=\"' + authenticationURL + '\">Click here!</a> to confirm your email!'
            }, function(err, json) {
            if (err) { return console.error(err); }
            req.session.flash = { type:'success', text:'Sent Email Successfully!' }
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
          req.session.flash = { type: 'success', text: 'Email verified successfully!' }
          res.render('email-verification.html');
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

// login function
router.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user) {
      if (err) {
        req.session.flash = { type: 'danger', text: err.message }
        return next(err);
      }
      if (!user) {
        req.session.flash = { type: 'danger', text: 'Email or Password is Incorrect, Please Try Agian'}
        res.redirect('/login');
      }
      req.logIn(user, function (err) {
        if (err) {
          req.session.flash = { type: 'danger', text: err.message }
          return next(err);
        }
        res.redirect('/');
      });
    })(req, res, next);
  });

// forget password page
router.get('/forget-password', (req, res) => {
    res.render("forget-password.html");
  });

// send forget password email verification
router.post('/forget-password-email', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
          req.session.flash = { type: 'danger', text: err.message }
          res.redirect('back');
        } else {
          if (!user) {
            req.session.flash = { type: 'danger', text: 'Email does not exist!' }
            res.redirect('back');
          } else {
            var authenticationResetURL = 'http://localhost:5000/reset-password/verify?authToken=' + user.authToken;
            sgMail.send({
              to:       user.email,
              from:     'yifengjin68@gmail.com',
              subject:  'Reset 47300 OnlineShopping Mall Password',
              html:     '<h3>You are receiving this email because you or someone else has requested a password reset for 47300 OnlineShopping Mall account <a target=_blank href=\"' + authenticationResetURL + '\">Click here!</a> to reset your password.'
            }, function(err, json) {
              if (err) { return console.error(err); }
                req.session.flash = { type: 'success', text:'Sent email successfully!' }
                res.redirect('/email-verification');
              });
          }
        }
    })
});

// reset password page
router.get("/reset-password/verify", function (req, res) {
    User.findOne({ authToken: req.query.authToken }, (err, user) => {
        if (err) {
          req.session.flash = {type: 'danger', text: err.message }
          res.redirect("back");
        } else {
          if (!user.authToken) {
            req.session.flash = {type: 'danger', text: "Error, Please Login First" }
            res.redirect("/login");
          } else {
            res.render("reset-password.html", {
              user: user,
            });
          }
        }
      }
    );
});

// reset password function
router.post("/reset-password", function (req, res) {
    User.findOne({ _id: req.body.id }, (err, user) => {
        if (!user) {
          req.session.flash = { type: 'danger', text: "User donsn't exist" }
          res.redirect("back");
        } else {
          user.setPassword(req.body.password, function (err) {
            if (err) {
              req.session.flash = { type: 'danger', text: "Reset Password Failed! Please Try Agian" }
              res.redirect("back");
            } else {
              req.session.flash = { type: 'success', text: "Reset Password Successfully! Plase Login" }
              user.save();
              res.redirect("/login");
            }
          });
        }
      }
    );
});

// logout function
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// export module
module.exports = router