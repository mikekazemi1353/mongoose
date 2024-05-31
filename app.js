/**
 * Module dependencies.
 */

// mongoose setup
require('./db');

var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var ejsEngine = require('ejs-locals');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');

var app = express();
var routes = require('./routes');

// all environments
app.set('port', process.env.PORT || 3001);
app.engine('ejs', ejsEngine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
  key: fs.readFileSync('path/to/server.key'),
  cert: fs.readFileSync('path/to/server.cert')
};

// Create HTTPS server
https.createServer(options, app).listen(app.get('port'), function () {
  console.log('Express HTTPS server listening on port ' + app.get('port'));
});
