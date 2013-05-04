var express = require('express'),
    locationmgr = require('./locationmgr');
 
// Create the express app. 
var app = express();
 
 // ## CORS middleware
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    console.log("writing cross domain headers...");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(allowCrossDomain);
});

// Create our supported routes. 
app.get('/locations', locationmgr.findAll);
app.get('/locations/:id', locationmgr.findById);
app.post('/locations', locationmgr.addLocation);
app.put('/locations/:id', locationmgr.updateLocation);
app.delete('/locations/:id', locationmgr.deleteLocation);
 
// Starting listening 
app.listen(3000);
console.log('Listening on port 3000...');