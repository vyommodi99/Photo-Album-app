var express = require('express');
var env = require('dotenv').config()
var ejs = require('ejs');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
const multer = require('multer');
const fs = require('fs')
mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');	

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));

var index = require('./routes/index');
app.use('/', index);
app.get('/image',function(req,res){
	Image.find({}, (err, items) => {
    console.log(items);
	  if (err) {
		  console.log(err);
	  }
	  else {
		  res.render('todo', { items: items });
	  }
  })
  });
  
  // Uploading the image to our database. POST
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads') // Here, we use Multer to take a photo and put it in a folder called ‘uploads’
                            // so we can easily access it later. 
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
  });
  var upload = multer({ storage: storage });

  app.post('/api/photo', upload.single('file'), function(req,res){
    try {
        let image = req.file
        console.log(image)
        let newImage = new Image(); // Here, we create an instance of our Item model
        newImage.name = req.body.name
        newImage.desc = req.body.desc
        // process.cwd() -> Project directory
        // __dirname -> Current directory
        newImage.img.data = fs.readFileSync(path.join(__dirname + '/uploads/' + image.filename)) 
        console.log("HERE!! : ", path.join(__dirname + '/uploads/' + image.filename))           
        newImage.img.contentType = 'image/jpg';
        newImage.save();
        res.redirect('/image')
    } catch (error) {
        console.error(error) 
        res.send("ERROR!")
    } 
  });
  
  app.post('/api/photoedit', upload.single('file'), function(req,res){
    console.log("InSIDEEE",req.body.id)
    try {
        Image.findOne({"_id": req.body.id},function(err,data){
          console.log(data)
          let image = req.file
          console.log(image)
          data.img.data = fs.readFileSync(path.join(__dirname + '/uploads/' + image.filename)) 
          data.img.contentType = 'image/jpg';
          data.save()
          console.log(data)
          res.redirect('/image')
        })
        // let newImage = new Image(); // Here, we create an instance of our Item model
        // newImage.name = req.body.name
        // newImage.desc = req.body.desc
        // // process.cwd() -> Project directory
        // // __dirname -> Current directory
        // console.log("HERE!! : ", path.join(__dirname + '/uploads/' + image.filename))           
        // newImage.save();
    } catch (error) {
        console.error(error) 
        res.send("ERROR!")
    } 
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Server is started on http://127.0.0.1:'+PORT);
});
