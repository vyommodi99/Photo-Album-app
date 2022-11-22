var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Image = require('../models/image');
var mongoose = require('mongoose');
const { response } = require('express');
const multer = require('multer');
const fs = require('fs')

const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '.env') })

// var storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'uploads') // Here, we use Multer to take a photo and put it in a folder called ‘uploads’
// 							// so we can easily access it later. 
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, file.fieldname + '-' + Date.now())
// 	}
//   });
//   var upload = multer({ storage: storage });

//   router.get('/',function(req,res){
// 	Image.find({}, (err, items) => {
// 	  if (err) {
// 		  console.log(err);
// 	  }
// 	  else {
// 		  res.render('todo', { items: items });
// 	  }
//   });
//   });
  
//   // Uploading the image to our database. POST
//   router.post('/api/photo', upload.single('file'), function(req,res){
// 	try {
// 	  let image = req.file
// 	  console.log(image)
// 	  let newImage = new Image(); // Here, we create an instance of our Item model
// 	  newImage.name = req.body.name
// 	  newImage.desc = req.body.desc
// 	  // process.cwd() -> Project directory
// 	  // __dirname -> Current directory
// 	  newImage.img.data = fs.readFileSync(path.join(__dirname + '/uploads/' + image.filename)) 
// 	  console.log("HERE!! : ", path.join(__dirname + '/uploads/' + image.filename))           
// 	  newImage.img.contentType = 'image/jpg';
// 	  newImage.save();
// 	  res.redirect('/')
// 	} catch (error) {
// 	  console.error(error) 
// 	  res.send("ERROR!")
// 	} 
//   });
  

// router.get('/', function (req, res, next) {
// 	return res.render('index.ejs');
// });


router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.email = req.body.email
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/login');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get('/todo',async function (req, res, next) {
	// User.findOne({unique_id:req.session.userId},function(err,data){
		console.log(req.session.userId)
		const userData = await Image.find({unique_id: req.session.userId});
		console.log("Printinggg")
		console.log(userData)
		res.render("todo", {data: userData});
	// })
});

// router.post('/todocompleted/:id',async function (req, res, next) {
// 		try {
// 			const id = req.params.id;
// 			const result = await Todo.findById(id);
// 			result.status = "Completed";
// 			result.save();
// 			console.log("Intoeditt",id,result)
// 			res.redirect('/todo')
// 			// res.send("Successful");
// 		} catch (error) {
// 			console.log(error);
// 		}
// });

// router.post('/createlist',async function (req, res, next) {
// 	try {
//         const data = new Todo({
// 			unique_id: req.session.userId,
//             task: req.body.task,
//             status: "todo"
//         });
//         const result = await data.save();
// 		console.log(result)
//         res.redirect('/todo')
//     } catch (error) {
//         console.log(error);
//     }
// });

router.post('/imagedelete',async function (req, res, next) {
	try {
		const id = req.body.id;
		console.log(id,req.session.email,req.body.password)
		User.findOne({email:req.session.email},async function(err,data){
			if(data){
				
				if(data.password==req.body.password){
					
					console.log(id)
					const result = await Image.findByIdAndDelete(id);
					console.log("DELETTEEE",result)
					res.redirect('/image')
					
				}else{
					res.redirect('/image')
				}
			}else{
				res.redirect('/image')
				// res.send({"Success":"This Email Is not regestered!"});
			}
		});
    } catch (error) {
        console.log(error);
    }
});

// router.post('/deleteCompleted',async function (req, res, next) {
// 	try {
//         const result = await Todo.deleteMany( { "status": "Completed" } );;
// 		console.log("DELETTEEE",result)
//         res.redirect('/todo')
//     } catch (error) {
//         console.log(error);
//     }
// });

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/register');
    	}
    });
}
});

router.post('/addimage',async function (req, res, next) {
	console.log(req,res)
	console.log("Inside");
	try {
        const data = new Image({
			unique_id: req.session.userId,
            label: req.body.label,
            image: req.body.file
        });
        const result = await data.save();
		console.log(result)
        res.redirect('/todo')
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;