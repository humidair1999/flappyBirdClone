var express = require('express');

var app = express();

// configure Express
app.configure(function() {
  app.use(express.compress());
  app.use(express.static(__dirname + '/public'));
});

app.listen(3000);