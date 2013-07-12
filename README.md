README

##Introduction

In this article I'll show you how to create a simple REST API support `GET`, `POST`, `PUT` and `DELETE` methods that you can use to power your web and mobile applicaitons.

The REST API will be built using Node.JS, using the Express framework, and storing / retrieving data in a MongoDB.

The REST API was created to act as a backend for an [Ember.JS CRUD Demo webapp](https://github.com/ddewaele/emberjs-crud-rest/) using the default EmberData RESTAdapter. As such, the API follows certain EmberData specific conventions. The API itself however remains pure REST.

The code is available in [Github](https://github.com/ddewaele/location-rest-api).

##Software requirements

In order to run this sample, you'll need to install the following software :

- NodeJS
- NPM
- MongoDB

See the references on the bottom of this tutorial to see where you can download these components. The respective websites show detailed information on how to install them on the platform of your choice.

To verify that the NodeJS / NPM installation was succesfull, execute the following command to see the versions of node and npm.

	node -v
	v0.10.2

	npm -v
	1.2.15

	mongod --version
	db version v2.0.4, pdfile version 4.5
	Tue Apr 30 06:42:09 git version: 329f3c47fe8136c03392c8f0e548506cb21f8ebf	

##MongoDB
In order to run this sample you need to setup a mongodb database. See the references section on how to install MongoDB on your platform.
MongoDB requires a location to store its database files. That location can be specified using the dbpath option.

You should see the following output: 

	./mongod --dbpath /Projects/Data/LocationDB
	Thu Apr 25 21:45:05 [initandlisten] MongoDB starting : pid=3329 port=27017 dbpath=/Projects/Data/LocationDB 64-bit host=Davys-MacBook-Air.local
	Thu Apr 25 21:45:05 [initandlisten] db version v2.0.4, pdfile version 4.5
	Thu Apr 25 21:45:05 [initandlisten] git version: 329f3c47fe8136c03392c8f0e548506cb21f8ebf
	Thu Apr 25 21:45:05 [initandlisten] build info: Darwin erh2.10gen.cc 9.8.0 Darwin Kernel Version 9.8.0: Wed Jul 15 16:55:01 PDT 2009; root:xnu-1228.15.4~1/RELEASE_I386 i386 BOOST_LIB_VERSION=1_40
	Thu Apr 25 21:45:05 [initandlisten] options: { dbpath: "/Projects/Data/LocationDB" }
	Thu Apr 25 21:45:05 [initandlisten] journal dir=/Projects/Data/LocationDB/journal
	Thu Apr 25 21:45:05 [initandlisten] recover : no journal files present, no recovery needed
	Thu Apr 25 21:45:05 [websvr] admin web console waiting for connections on port 28017
	Thu Apr 25 21:45:05 [initandlisten] waiting for connections on port 27017

MongoDB also comes with an interactive shell that you can start.

	./mongo
	MongoDB shell version: 2.0.4
	connecting to: test


## The REST API

### All code required to run the REST API can be found at 

To start the REST API, make sure that your MongoDB is up and running and type the following command to install the module dependencies

	npm install

Type in the following command to start the server :

	node server.js

Of you see the following output everything should be up and running.

	Listening on port 3000...
	Connected to 'locationdb' database

You can verify that the server is up and running by going to the following URL in your browser :	

	http://localhost:3000/locations

Or by executing the following CURL command

	curl http://localhost:3000/locations


### Setting up Express

The first thing we'll do is create the Express app and configure a logger and a bodyParser.

	// Create the express app. 
	var app = express();
	 
	app.configure(function () {
	    app.use(express.logger('dev'));
	    app.use(express.bodyParser());
	});

The dev logger will log all of our REST calls to the console

	POST /locations 200 2ms - 134b
	GET /locations 200 0ms - 287b
	DELETE /locations/517f4f9c8cd4f6ca28000002 200 1ms - 2b
	GET /locations 200 1ms - 155b
	POST /locations 200 1ms - 125b

The bodyParser will allow us to access the body of the request in a convenient way.

### Specify our routes

Next up we need to define the routes that we want to support. For this API we'll be working with location resources, and we'll be supporting the GET / POST / PUT and DELETE methods.

| HTTP Method        | URL           | Description  |
| ------------- |-------------| -----|
| GET | /locations | locationmgr.findAll | Retrieves all location objects |
| GET | /locations/:id | locationmgr.findById | Retrieves a specific location object by id |
| POST | /locations | locationmgr.addLocation | Adds a location object |
| PUT | /locations/:id | locationmgr.updateLocation | Adds a location object |
| DELETE | /locations/:id | locationmgr.deleteLocation | Deletes a location object |

Implementing the 5 calls is done like this:

	app.get('/locations', locationmgr.findAll);
	app.get('/locations/:id', locationmgr.findById);
	app.post('/locations', locationmgr.addLocation);
	app.put('/locations/:id', locationmgr.updateLocation);
	app.delete('/locations/:id', locationmgr.deleteLocation);

Here we specify 

- the method that is required to trigger the route (get,post,put,delete) 
- the path that is required to access the route.
- the Express function that will handle the request.


### Connecting to the database

We'll use the native MongoDB driver to connect to our MongoDB instance. Make sure it is started and ensure that it's running on port 27017.
We'll attempt to open the "locationdb". If the database doesn't exist, MongoDB will automatically create it.
If we are unable to open the database we'll throw an error.

	var server = new Server('localhost', 27017, {auto_reconnect: true});

	db = new Db('locationdb', server);
	 
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


# The REST calls

## The data

### The data

In our REST service we'll work with location objects modelled in JSON like this:

	{
	  "location": {
		"latitude": 37.3860517,
		"longitude": -122.0838511,
		"accuracy": 5000,
		"_id": "517d721ef715b0da1b000001"
	  }
	}

As you can see the JSON structure contains a root element indicating the element type (location). Included in the root element are the fields of the location (latitude,longitude,accuracy). Notice how we also have an _id field here. This is the _id that MongoDB has assigned to it when it got persisted in the database. Locations that haven't been persisted yet will not contain the _id field.


## POST - Adding a location

### Curl command

	curl -i -X POST -H 'Content-Type: application/json' -d '{"location": {"latitude":37.3860517,"longitude":-122.0838511,"accuracy":5000}}' http://localhost:3000/locations

As you can see, we are executing a ```POST``` request , containing a ```JSON``` payload, representing the location object we just saw. There's no ```_id``` field involved here, as we haven't persisted the object yet.

### JSON Request payload

When Ember.JS wants to save a single object, it sends the following payload to the REST API.

	{
	  "location": {
		"latitude": 37.3860517,
		"longitude": -122.0838511,
		"accuracy": 5000
	  }
	}

Notice how all properties are wrapped in a root location element. Keep in mind that this is not how we are going to save it in our MongoDB. We'll strip off the location root element and simply save the latitude/longitude and accuracy properties as part of a simple object.

### JSON Response payload

Tt expects the same type of structure in the JSON response, only this time also including the ID field.


	{
	  "location": {
		"latitude": 37.3860517,
		"longitude": -122.0838511,
		"accuracy": 5000,
		"_id": "517d721ef715b0da1b000001"
	  }
	}


### Express

The code to insert a location.

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

The first thing we do is retrieve the location object using ```req.body.location```. This gives us a JSON structure containing the latitude / longitude and accuracy. We are inserting that object into the locations collection.
Keep in mind that we are not storing the ```location``` wrapper element here.
	
## GET Retrieve single record

### Curl command

	curl -i -X GET http://localhost:3000/locations/51798af4d0c4c30c0d00001c

As you can see, in this ```GET``` request we specify the ```_id``` value in the URL.

### JSON Request

No JSON payload required. Everything is encoded in the URL.

### JSON Response

	{
	  "location": {
		"latitude": "10",
		"longitude": "20",
		"accuracy": null,
		"_id": "517d64d83f52f3c61a000001"
	  }
	}

Notice how all properties (including the ID property "_id") is wrapped in a root location element.

### Express code

	exports.findById = function(req, res) {
		var id = req.params.id;
		console.log('Retrieving location with _id = [ ' + id + ']');
		db.collection('locations', function(err, collection) {
			collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
				// Wrap the location in a root element called "location".
				res.json({location:item});
			});
		});
	};

As we mentioned in the previous call, the objects stored in the MongoDB do not contain the wrapper ```location``` element.
Ember.js however expects that when we're searching for a resource by id that the REST API returns a JSON structure with a root element indicating the model name. So after having found the location, we'll return it by wrapping it in a location element. 

## GET - Retrieve collection

### Curl command

	curl -i -X GET http://localhost:3000/locations

This is a simple ```GET``` request returning all locations.

### JSON Request

No JSON payload required. 

### JSON Response

	{
	  "locations": [
		{
		  "latitude": "10",
		  "longitude": "20",
		  "accuracy": null,
		  "_id": "517d64d83f52f3c61a000001"
		},
		{
		  "latitude": "30",
		  "longitude": "40",
		  "accuracy": null,
		  "_id": "517d64e33f52f3c61a000002"
		}
	  ]
	}

Notice how we have a root element called ```locations```, followed by an array of location objects. 
The location objects themselves **do not** have a location root element.
	
### Express code

	exports.findAll = function(req, res) {
		db.collection('locations', function(err, collection) {
			collection.find().toArray(function(err, items) {
				// Wrap the location array in a root element called "locations".
				res.send(locations:items);
			});
		});
	};
We are wrapping the array response into a root element called ```locations```.

## DELETE - Deleting a location 

### Curl command

	curl -i -X DELETE http://localhost:3000/location/51798af4d0c4c30c0d00001c

This ```DELETE``` request resembles the ```GET``` request we saw earlier. We simply pass the ```_id``` field that we want ot delete.

### JSON Request

No JSON payload required. 

### JSON Response

When this function succeeds, an empty JSON response {} is returned to the client. This is required by EmberJS.

### Express code

	exports.deleteLocation = function(req, res) {
	    var id = req.params.id;
	    db.collection('locations', function(err, collection) {
	        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
	            if (err) {
	                res.send({'error':'An error has occurred - ' + err});
	            } else {
	                res.json({});
	            }
	        });
	    });
	}

This code is again very straightforward. WE simply remove an object from the collection based on the id that was sent as a request parameter.


##PUT - Modify location

### Curl command

	curl -i -X PUT -H 'Content-Type: application/json' -d '{"location": {{"latitude":37.3860517,"longitude":-122.0838511,"accuracy":5000}}' http://localhost:3000/locations/5069b47aa892630aae000007

### JSON Request

The JSON request payload to modify a resource looks like this:

	{
	  "location": {
		"latitude": 37.3860517,
		"longitude": -122.0838511,
		"accuracy": 5000
	  }
	}

Identical to the one used in the POST (create) method, we simpyl wrap our properties in a root location element.


### JSON Response

Tt expects the same type of structure in the JSON response, only this time also including the ID field.

	{
	  "location": {
		"latitude": 37.3860517,
		"longitude": -122.0838511,
		"accuracy": 5000,
		"_id": "517d721ef715b0da1b000001"
	  }
	}
	
### Express code

	exports.updateLocation = function(req, res) {
	    
	    var id = req.params.id;
	    var location = req.body.location;
	    
	    db.collection('locations', function(err, collection) {
	        collection.update({'_id':new BSON.ObjectID(id)}, location, {safe:true}, function(err, result) {
	            if (err) {
	                res.send({'error':'An error has occurred'});
	            } else {
	                location._id = id;
	                res.json({location:location});
	            }
	        });
	    });
	}

## Setting up CORS

If you want to be able to call this REST API from a different domain than the one this REST API will be hosted on you'll need to setup CORS (Cross-origin resource sharing) up properly.

This is pretty straightforward in Express as it is simply a matter of specifying the correct HTTP Access-Control-Allow-* headers.

	app.use(express.methodOverride());

	// ## CORS middleware
	// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
	var allowCrossDomain = function(req, res, next) {
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
	app.use(allowCrossDomain);



References
- [NodeJS](http://nodejs.org/)
- [MongoDB](http://www.mongodb.org/)
- [Express](http://expressjs.com/)
- [Install mongoDB on MacOS X](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
- [Install mongoDB on Windows](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/)
- [Install mongoDB on Linux](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/)
