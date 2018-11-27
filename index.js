var app = require('express')();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;
var multer = require('multer');
var bodyParser = require('body-parser');
var Msg = require('./models/msg.model');
var Users = require('./models/user.model');
const fs = require('fs');
const sharp = require('sharp');

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket){
  socket.on('join', function(userNickname){
    var sdf = {
      message:userNickname
    };
    var test = new Msg(sdf);
    test.save(function (err) {
        io.emit('userjoinedthechat', userNickname);
    });
  });
  



  // ---------------------Profile Create - open-------------------------

  socket.on('userProfileCreate', function(userProfileCreate){
      Users.findOne({ full_mobile: userProfileCreate.full_mobile}, function (err, userProfilesDetails) {
          if(!userProfilesDetails){
              var newUser = new Users(userProfileCreate);
              newUser.save(function (err) {
                io.emit('userProfileCreate', {
                  status: 1,
                  message:'New User Saved!'
                });
              });
          }else{
            Users.findOneAndUpdate({_id:userProfilesDetails.id}, userProfileCreate, function (err, place) {
                io.emit('userProfileCreate', {
                  status: 1,
                  message:'User Profile Updated!'
                });
            });
          }
      });
  });

  // ---------------------upload file - Open-------------------------
  var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./uploads/cache");
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
  });
  
  var upload = multer({ storage: Storage }).single('avatar');

  app.post('/profile', function(req,res){
    upload(req, res, function(err) {
      if (err) {
          return res.send({
            status: 0,
            message:'Something went wrong!',
            filename: req.file.filename
          });
      }
      sharp('./uploads/cache/'+ req.file.filename)
        .resize(1024, 1024)
        .jpeg({quality: 100, chromaSubsampling: '4:4:4', force: true})
        .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
        .toFile('./uploads/profile_pics/'+ req.file.filename, (err) => {
          if(err){
            console.log('Error ' + fileOut + ' ' + err.toString());
          }else{
            fs.unlink('./uploads/cache/'+ req.file.filename, (err) => { 
              if (err) {
                console.log('error deleting '  + ' ' + err.toString());
              } else {
                return res.send({
                    status: 1,
                    message:'File uploaded sucessfully!',
                    filename: req.file.filename
                });
              }
          });
          }
        });
        sharp.cache(false);
        
    });
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
