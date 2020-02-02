var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const bodyParser =  require('body-parser');
var indexRouter = require('./routes/index');
const users  = require('./routes/users');
const ankety = require('./routes/ankety');
const play = require('./routes/play');
const results = require('./routes/results');

var fileUpload = require("express-fileupload");
var mongo = require('mongodb');

var app = express();

app.use(fileUpload());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded())
app.use('/', indexRouter);
app.use('/users', users);
app.use('/ankety', ankety);
app.use('/play', play);
app.use('/results', results);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
