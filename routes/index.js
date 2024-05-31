const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const ejsEngine = require('ejs-locals');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('./models/user'); // Adjust the path to your User model

const app = express();
const routes = require('./routes');

// all environments
app.set('port', process.env.PORT || 3001);
app.engine('ejs', ejsEngine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Routes
app.use(routes.current_user);
app.get('/', routes.index);
app.post('/', routes.index);

// Add the option to output (sanitized!) markdown

// development only
if (app.get('env') == 'development') {
  app.use(errorHandler());
}

// Read SSL certificate and key
const options = {
  key: fs.readFileSync(path.join(__dirname, 'path/to/server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'path/to/server.cert'))
};

// Create HTTPS server
https.createServer(options, app).listen(app.get('port'), function () {
  console.log('Express HTTPS server listening on port ' + app.get('port'));
});

exports.index = [
  // Validate and sanitize inputs
  body('username').trim().isAlphanumeric().escape(),
  body('password').trim().isLength({ min: 5 }).escape(),

  (req, res, next) => {
    // Find validation errors in this request and wrap them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract sanitized inputs
    const username = req.body.username;
    const password = req.body.password;

    var flag;
    fs.readFile('./flag', function(err, data) {
      if (err) {
        throw err;
      }
      flag = data;

      // Use parameterized query to prevent NoSQL injection
      User.find({ username: username, password: password }, function(err, users) {
        if (err) {
          return next(err);
        }
        if (users.length > 0) {
          return res.render('index', {
            title: 'Admin Access Granted',
            granted: true,
            flag: flag,
          });
        } else {
          return res.render('index', {
            title: 'Have you tried pa55w0rd?',
            granted: false,
          });
        }
      });
    });
  }
];
