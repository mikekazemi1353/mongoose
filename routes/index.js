const { body, validationResult } = require('express-validator');
const fs = require('fs');
const User = require('./models/user'); // Adjust the path to your User model

function findUser(auth) {
  return users.find((u) => u.name === auth.name && u.password === auth.password);
}

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
