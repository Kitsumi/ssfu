var express = require('express');
var multer  = require('multer');
var jsonfile = require('jsonfile');
var database = {};
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        var name = nameGen();
        var ext = file.originalname.split(".");
        ext = ext[ext.length-1];
        database.filenames.push(name);
        saveDatabase(database);
        console.log(database);
        cb(null, name+'.'+ext)
    }
});
var upload = multer({ 
    storage: storage,
    onFileUploadStart: function(file, req, res){
        if(req.files.file.length > 100000) {
          return false;
        } else {
          res.redirect(req.files.file.path);
        }
    }
});

function nameGen() {
    var name = (Math.floor(Math.random() * (2821109907455 - 806031402130 + 1)) + 806031402130).toString(36);
    if (database.filenames.indexOf(name) != -1) {
        return nameGen();
    } else {
        return name;
    }
}   

function saveDatabase(obj, init) {
    jsonfile.writeFile('database.json', obj, function(err) {
        if (err) {
            console.log('Database Initialization Errors: '+err);
        } else if (init) {
            console.log('Database Initialized');
            jsonfile.readFile('database.json', function(err, obj){
                database = obj;
            });
        }
    });
}

jsonfile.readFile('database.json', function(err, obj) {
    database = obj;
    if (err) {
        saveDatabase({ "filenames":["init","true"] }, true);
    } else {
        console.log('Database loaded.');
    }
});

var app = express();

app.use('/', express.static(__dirname + '/public/'));

app.post('/upload', upload.single('file'), function(req, res){
    res.redirect('/uploads/'+req.file.filename);
    res.status(204).end();
});

app.listen(80);
