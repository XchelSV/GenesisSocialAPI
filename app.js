var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session       = require('express-session');
var uuid = require('uuid');
var multipart = require('connect-multiparty');
var redis = require('redis');

var routes = require('./routes/index');
var routes_place = require('./routes/place');
var routes_devotional = require('./routes/devotional');
var routes_post = require('./routes/post');
var routes_user = require('./routes/user');
var routes_auth = require('./routes/auth');

var app = express();
//var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var client = redis.createClient();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(multipart());
app.use(cookieParser());
app.use(session({

        genid: function (req){ return uuid.v1()},
        secret: 'q~!!#s4HALA^MADRIDcds4<>>*S3--_-`´ç@',
        saveUninitialized:  false,
        resave:       false
      }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/', routes_place);
app.use('/', routes_devotional);
app.use('/', routes_post);
app.use('/', routes_user);
app.use('/', routes_auth);


var connStr = 'mongodb://localhost:27017/GenesisAPIDB';
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('MongoDB al Cientifico!');
});

client.on('connect', function (){
    console.log('Nuevo Cliente de Redis al Tiro!');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
