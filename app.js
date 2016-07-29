
/**
 * Module dependencies.
 */

var express = require('express')
	, bodyParser = require('body-parser')
	, methodOverride = require('method-override')
	, favicon = require('serve-favicon')
	, morgan = require('morgan')
	, errorHandler = require('error-handler')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
var app = express();
	
var mongo = require('mongodb')
	, Server = mongo.Server
	, Db = mongo.Db
	, Bson = mongo.BSONPure
	, ObjectId = mongo.ObjectID;;

var fs = require('fs')
	, multer = require('multer');
var upload = multer({ dest: __dirname+'/uploads/' });

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(favicon(__dirname + '/public/favicon.ico'));//app.use(express.favicon());//주소창에 보이는 아이콘
app.use(morgan('combined'))//app.use(express.logger('dev'));
app.use(bodyParser.json());	//To access client's dom.
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
//app.use(app.router);//deprecated
app.use(express.static(path.join(__dirname, 'public')));
//app.use(multer({dest:'./uploads/'}).single('myFile'));
//app.use(multer({dest:'./uploads/'}).array('photos'));
//app.use(multer({dest:'./uploads/'}).fields('board'));
app.use(upload.any());

//Connect Database
var dbName = 'board';//This is like a tablespace in OracleDB
var server = new Server('localhost',27017,{auto_reconnect:true});
var db = new Db(dbName, server);//db name

db.open(function(err, db){
	if(!err){
		console.log("Connected "+dbName+" database");
		db.collection(dbName,{strict:true}, function(){
			if(err){
				console.log("The "+dbName+" collection doesn't exist. Creating it with sample data...");
				routes.populateDB();
			}
		});
	}
});

//Initialize object
routes.init(__dirname, db, ObjectId, fs, upload);

app.get('/', routes.findAll);
app.get('/board', routes.findAll);
app.get('/board/:currentPage', routes.findAll);
app.get('/board/id/:id', routes.findById);
app.post('/board', routes.addBoard);
app.get('/users', user.list);



/****Create Server*/
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
