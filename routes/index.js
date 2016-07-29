
/*
 * GET home page.
 */
var rootPath
	, db
	, ObjectId
	, fs
	, upload
	, pb;

exports.init = function(_rootPath, _db, _ObjectId, _fs, _upload){
	rootPath = _rootPath;
	db=_db;
	ObjectId=_ObjectId;
	fs=_fs;
	upload = _upload;
	pb = new PagingBean();
}

//Get board list
exports.findAll = function(req, res){
	var boardResult = null;
	var currentPage = req.params.currentPage;
	
	// Peform a simple find and return all the documents
	//db.collection('board').find().sort({_id:-1}).limit(10).toArray(function(err, docs) {
	db.collection('board').find().sort({_id:-1}).toArray(function(err, docs) {
		//sort is order by in oracle. 1 is ascending and -1 is descending.
		//console.log(docs);
		
		//console.log("pb: "+pb.pageSize);
		db.collection('board').count({}, function(error, numOfDocs) {
				pb.init(currentPage, numOfDocs, 10,10);
				res.render('index', {"boards" : docs,"pb" : pb});
		});
	});
};

//Get a board by id
exports.findById = function(req, res){
	var id = req.params.id;
	var obj_id = new ObjectId(id);
	
	console.log("id: "+id);
	db.collection('board').findOne({"_id": obj_id},function(err, doc){
		//console.log(doc);
		res.send(doc);
	});
};

//Post a board
exports.addBoard = function(req, res){
	var board = req.body;
	var myFile = req.files[0];//this files is array. Attention
	
	//console.log(myFile);
	if(myFile != null){
		obj = {
			"title":board.title,
			"writer" : board.writer,
			"content":board.content,
			"regdate":new Date(),
			"photo":{
				"originalname" : myFile.originalname,
				"filename" : myFile.filename,
				"mimetype" : myFile.mimetype
			}
		};
	}else{
		obj = {
			"title":board.title,
			"writer" : board.writer,
			"content":board.content,
			"regdate":new Date()
		}
	}
	

	db.collection('board').insertOne( obj, function(err, result){
			if(err){
				console.log("Failed inserting a document into the board collection.");
				res.send("Fail");
			}
			
			if(obj.photo == null){
				res.send("Success");
				return;
			}
			
			/*files are saved '/uploads/' if you don't use below fs.
			* Saved just as a file, and file don't have a extension.*/
			//Upload file
			var uploadPath = myFile.path;
			console.log("uploadPath: "+uploadPath);
			
			fs.readFile(uploadPath, function (err, data) {
				var str = myFile.mimetype;
				//console.log("str: "+str);
				var newPath = rootPath+"/public/data/"+myFile.filename+"."+str.substring(str.lastIndexOf('/')+1,str.length);
				//console.log("newPath: "+newPath);
				fs.writeFile(newPath, data, function (err) {
					if(err){
						console.log("File upload error");
					}
				});
			});
			fs.unlinkSync(uploadPath);//Delete file in upload folder when it's finished uploading.
			//console.log("Inserted a document into the board collection.");
			res.send("success");
	});
}

exports.updateBoard= function(req, res){
	console.log("하이루!!");
}

exports.deleteBoard = function(req, res){
	console.log("하이루!!");
}

var PagingBean = function(){
	this.currentPage = 1;
	this.totalRecord;
	this.pageSize;
	this.totalPage;	//수시로 변한다
	this.blockSize;
	this.firstPage;
	this.lastPage;
	this.curPos;
	this.num;
	
	this.init = function(currentPage, totalRecord, pageSize, blockSize){
		this.currentPage = currentPage;
		if(this.currentPage<=0 || this.currentPage==null){
			this.currentPage=1;
		}
		this.totalRecord = totalRecord;
		this.pageSize = pageSize;
		this.totalPage = parseInt(Math.ceil(parseFloat(this.totalRecord)/parseFloat(this.pageSize)));
		this.blockSize = blockSize;
		this.firstPage = this.currentPage-(this.currentPage-1)%this.blockSize;
		this.lastPage = this.firstPage+(this.blockSize-1);
		this.curPos = (this.currentPage-1)*this.pageSize;
		this.num = this.totalRecord - this.curPos;
	}
}

exports.populateDB = function() {

    var board = {
        name: "CHATEAU DE SAINT COSME",
        title: "2009",
        content: "Grenache / Syrah",
        regdate: new Date(),
        hit: 1
    };

    db.collection('board', function(err, collection) {
        collection.insert(board, {safe:true}, function(err, result) {});
    });
};
