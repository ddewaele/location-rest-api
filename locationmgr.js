var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});

db = new Db('locationdb', server, {safe:false});
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'locationdb' database");
        db.collection('locations', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'locations' collection doesn't exist yet.");
            }
        });
    } else {
        console.log("Error while connecting to the locationdb : " + err);
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving location with _id = [ ' + id + ']');
    
    db.collection('locations', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.json({location:item});
        });
    });
};
 
exports.findAll = function(req, res) {

    console.log('Retrieving all locations');

    db.collection('locations', function(err, collection) {
        collection.find().toArray(function(err, items) {
            // Wrap the array in a root element called locations.
            var allLocations = {
                locations:items
            };
            res.send(allLocations);
        });
    });
};
 
exports.addLocation = function(req, res) {
    
    var location = req.body.location;
    
    console.log('Adding location: ' + JSON.stringify(location));

    db.collection('locations', function(err, collection) {
        collection.insert(location, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                var record = result[0];
                res.json({location:record});
            }
        });
    });
}
 
exports.updateLocation = function(req, res) {
    
    var id = req.params.id;
    var location = req.body.location;
    
    console.log('Updating location with id [' + id + ']');
    console.log('Location payload = ' + JSON.stringify(location));
    
    db.collection('locations', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, location, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating location: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                location._id = id;
                res.json({location:location});
            }
        });
    });
}
 
exports.deleteLocation = function(req, res) {
    var id = req.params.id;
    console.log('Deleting location: ' + id);
    db.collection('locations', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.json({});
            }
        });
    });
}
