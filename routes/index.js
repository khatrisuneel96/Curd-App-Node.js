var express = require('express');
var multer = require('multer')
var path = require('path');
var jwt = require('jsonwebtoken');
var empModel = require('../modules/employee');
var uploadModel = require('../modules/upload');

var router = express.Router();
var employees = empModel.find({});
var imageData = uploadModel.find({});

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

router.use(express.static(__dirname+"./public/"));



/* GET home page. */
//Uploading Image
var Storage = multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req, file, cb)=>{
    cb(null, file.fieldname+'_'+Date.now()+path.extname(file.originalname));
  }
});

var upload = multer({
  storage: Storage
}).single('file');

router.post('/upload/', upload ,function(req, res, next) {
  var imageFile = req.file.filename;
  var success = req.file.filename + " Uploaded Successfully!"; 

  var imageDetails = new uploadModel({
    imagename: imageFile
  });
  imageDetails.save(function(err, doc){
    if(err) throw err;

    imageData.exec(function(err, data){
      if(err) throw err;
      res.render('upload-file', { title: 'Upload File', records: data, success: ' '+success });
    }); 
  });
});

router.get('/upload/', function(req, res, next) {
  imageData.exec(function(err, data){
    if(err) throw err;
    res.render('upload-file', { title: 'Upload File', records:data, success:'' });
  });
});

//Middleware to check login or not
function checkLogin(req, res, next){
  var myToken = localStorage.getItem('myToken');
  try {
    jwt.verify(myToken, 'loginToken');
  } catch(err) {
    // err
    res.send("To access this page you need to login first..");
  }
  next();
}

//Login & Logout
// router.get('/login', function(req, res, next) {
//   var token = jwt.sign({ foo: 'bar' }, 'loginToken');
//   localStorage.setItem('myToken', token);
//   res.send('Login Successfully!');
// });

// router.get('/logout',function(req, res, next) {
//   localStorage.removeItem('myToken');
//   res.send('Logout Successfully!');
// });

//Show All Record
router.get('/', function(req, res, next) {
  employees.exec(function(err, data){
    if(err) throw err;
    res.render('index', { title: 'Employee Records', records: data, success:'' });
  });
});

//Inserting New record
router.post('/', upload , function(req, res, next) {
  // var imageFile = req.file.filename;
  var empDetails = new empModel({
      name: req.body.uname,
      email: req.body.email,
      etype: req.body.emptype,
      hourlyRate: req.body.hrlyrate,
      totalHour: req.body.ttlhr,
      total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
      image: req.file.filename,
    
      });
  
  empDetails.save(function(err, req1){
    if(err) throw err;
    employees.exec(function(err, data){
      if(err) throw err;
    res.render('index', { title: 'Employee Records', records: data, success: " Record Inserted Successfully" });
    });
  });

});

//Searching record
router.post('/search/', function(req, res, next) {
  var fltrName = req.body.fltrname;
  var fltrEmail = req.body.fltremail;
  var fltremptype = req.body.fltremptype;

  if(fltrName !='' && fltrEmail !='' && fltremptype !=''){
    var fltrParameters = {$and: [{name: fltrName},
      {$and: [{email: fltrEmail}, {etype: fltremptype}]}
      ]}
  } else if(fltrName =='' && fltrEmail !='' && fltremptype !=''){
    var fltrParameters = {$and: [{email: fltrEmail}, {etype: fltremptype}
    ]}
  } else if(fltrName !='' && fltrEmail =='' && fltremptype !=''){
    var fltrParameters = { $and: [{name: fltrName}, {etype: fltremptype}
    ]}
  } else if(fltrName =='' && fltrEmail =='' && fltremptype !=''){
    var fltrParameters = { etype: fltremptype}
  } else{
    var fltrParameters = {}
  }

  var fltrEmployee = empModel.find(fltrParameters);
  fltrEmployee.exec(function(err, data){
    if(err) throw err;
    res.render('index', { title: 'Employee Records', records: data, success:'' });
  });
});

//Deleting Record
router.get('/delete/:id',function(req, res, next) {
  var id = req.params.id;
  var del = empModel.findByIdAndDelete(id);
  del.exec(function(err, data){
    if(err) throw err;
    employees.exec(function(err, data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records: data, success: " Record Deleted Successfully" });
    });
  });
});

//Editing Record
router.get('/edit/:id', function(req, res, next) {
  var id = req.params.id;
  var edit = empModel.findById(id);
  edit.exec(function(err, data){
    if(err) throw err;
    res.render('edit', { title: 'Edit Employee Records', records: data });
  });
});

//After Editing, Update record
router.post('/update', upload, function(req, res, next) {
  if(req.file){
    var dataRecords = {
          name: req.body.uname,
          email: req.body.email,
          etype: req.body.emptype,
          hourlyRate: req.body.hrlyrate,
          totalHour: req.body.ttlhr,
          total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
          image: req.file.filename,
      }
  }else{
    var dataRecords = {
          name: req.body.uname,
          email: req.body.email,
          etype: req.body.emptype,
          hourlyRate: req.body.hrlyrate,
          totalHour: req.body.ttlhr,
          total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
      }
  }
  var update = empModel.findByIdAndUpdate(req.body.id, dataRecords)
  update.exec(function(err, data){
    if(err) throw err;
    employees.exec(function(err, data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records: data, success: " Record Edited Successfully" });
      //res.redirect("/");
    });
  });
});

//Autocomplete
router.get('/autocomplete/', function(req, res, next) {
  var regex = new RegExp(req.query["term"], 'i');
  var fltrEmployee = empModel.find({name: regex}, {'name':1}).sort({"updated_at":-1}).sort({"created_at": -1}).limit(20);
  fltrEmployee.exec(function(err, data){
    
    var result = [];
    if(!err){
      if(data && data.length && data.length>0){
        data.forEach(user=>{
          let obj={
            id: user._id,
            label: user.name
          };
          result.push(obj);
        });
      }
      res.jsonp(result);
    }
  });

});

module.exports = router;
