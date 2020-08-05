var express = require('express');
var accountModel = require("../models/account-model");
var accountService = require("../services/account-services")
const { route } = require('./users');
var bcrypt = require('bcryptjs');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
const { AccountModel } = require('../models/account-model');
const e = require('express');
var router = express.Router();

/* GET home page. */
var checkLogin = (req,res,next)=>{
  var token = req.cookies.token;
  var decodeId = jwt.verify(token, "nodemyK6");
  accountModel.AccountModel.find({
    _id: decodeId.payload
  }).then(function(data){
    if(data){
      res.data = data;
      next();
    }else{
      res.json({
        err: true,
        message: "You haven't been login ever"
      })
    }
  })
}
var checkLogin = (req,res,next)=>{
  var token = req.cookies.token;
  var decodeId = jwt.verify(token, "nodemyK6");
  accountModel.AccountModel.find({
    _id: decodeId.payload
  }).then(function(data){
    if(data){
      res.data = data;
      next();
    }else{
      res.json({
        err: true,
        message: "You haven't been login ever"
      })
    }
  })
}
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/show",(req,res,next)=>{
  accountModel.AccountModel.find().then(function(data){
    res.json({
      err: false,
      data: data
    })
  })
})

router.get("/register", (req,res,next)=>{
  res.render("register");
})

router.get("/register-book", (req,res,next)=>{
  res.render("register-book");
})

router.post("/register", (req,res,next)=>{
  accountModel.AccountModel.find({
    username: req.body.username
  }).then(function(data){
    if(data.length == 0){
      next();
    }else{
      res.json({
        err: true,
        message: "This account is existed"
      })
    }
  })
},(req,res,next)=>{
  var account = {};
  account.username = req.body.username;
  if(req.body.role){
    account.role = req.body.role;
  }else{
    account.role = 1
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      account.password = hash;
      accountModel.AccountModel.create(account).then(function(data){
        res.json({
          err: false,
          message: "Register successful"
        })
      })
    });
  }); 
})

router.post("/register-book", (req,res,next)=>{
  accountModel.BookModel.find({
    name: req.body.name
  }).then(function(data){
    if(data.length == 0){
      next();
    }else{
      res.json({
        err: true,
        message: "This book is existed"
      })
    }
  })
},(req,res,next)=>{
  var account = {};
  account.name = req.body.name;
  if(req.body.author) account.author = req.body.author;
  accountModel.BookModel.create(account).then(function(data){
    res.json({
      err: false,
      message: "Register book successful"
    })
  }) 
})

router.get("/login", (req,res,next)=>{
  res.render("login");
})

router.post("/login", (req,res,next)=>{
  accountModel.AccountModel.find({
    username: req.body.username
  }).then(function(data){
    if(data.length > 0){
      var payload = data[0]._id;
      var token = jwt.sign({
        payload
      }, "nodemyK6");
      res.cookie("token", token, {maxAge: 1000*60*60*2*24});
      res.data = data;
      next();
    }else{
      res.json({
        err: true,
        message: "This account is not exist"
      })
    }
  })
},(req,res,next)=>{
  bcrypt.compare(req.body.password, res.data[0].password, function(err, value) {
    if(value == true){  
        accountService.updateUserLogin(res.data[0]._id, true).then((user) => {
          var data = res.data;
            return res.json({
                data: data,
                err: false,
                message: "Login successful!!!"
            })
        }).catch((err) => {
            
        });          
    }else{
        return res.json({
            err: true,
            message: "Wrong password or username!!!"
        })
    }
});
})

router.get("/logout", checkLogin, (req,res,next)=>{
  var data = res.data
  accountService.updateUserLogin(data[0]._id, false).then((user) => {
      return res.json({
          err: false,
          message: "Logout successful!!!"
      })
  }).catch((err) => {
      
  });          
})

router.get("/home", (req,res,next)=>{
  res.render("home");
})

var checkStudentRole = (req,res,next)=>{
  if(res.data[0].role > 0){
    next();
  }else{
    res.json({
      err: true,
      message : "Not permission"
    })
  }
}
var checkTeacherRole = (req,res,next)=>{
  if(res.data[0].role > 1){
    next();
  }else{
    res.json({
      err: true,
      message : "Not permission"
    })
  }
}
var checkManagerRole = (req,res,next)=>{
  if(res.data[0].role > 2){
    next();
  }else{
    res.json({
      err: true,
      message : "Not permission"
    })
  }
}

router.get("/role", checkLogin, (req,res,next)=>{
  res.json({
    data: res.data,
    message: "Check role!!!"
  })
})

router.get("/student", checkLogin,  (req,res,next)=>{
  accountModel.AccountModel.find({
    role: 1
  })
  .then(function(data){
    res.render("student", {data: data});
  })
})

router.post("/student", checkLogin, checkStudentRole, (req,res,next)=>{
  res.json({
    err: false,
    message: "This is list-student"
  })
})

router.post("/add-book", checkLogin, checkManagerRole, (req,res,next)=>{
  var name = req.body.name;
  accountModel.BookModel.find({
    name: name
  }).then(data=>{
    if(data.length > 0){
      res.data = data;
      next();
    }else{
      res.json({
        err: true,
        message: "This book is not exist"
      })
    }
  })
},(req,res,next)=>{
  var id = req.body.id;
  accountModel.AccountModel.find({
    $and: [{ "_id": id},
      { "idBook": {$in: [res.data[0]._id]} 
    }]
  }).then(data=>{
    if(data.length < 1){
      next();
    }else{
      res.json({
        err: true,
        message: "This book is existed!!!"
      })
    }
  })
},(req,res,next)=>{
  var id = req.body.id;
  accountModel.AccountModel.update({
    _id: id
  }, {
    $push: {idBook: [res.data[0]._id]}
  }).then(data=>{
    res.json({
      err: false,
      message: "Add book successful!!!"
    })
  })   
})

router.delete("/student", checkLogin, checkTeacherRole, (req,res,next)=>{
  var username = req.body.username
  accountModel.AccountModel.deleteOne({
    username: username
  }).then((result) => {
    res.json({
      err: false,
      message: "Delete successful"
    })
  }).catch((err) => {
    
  });
})

router.put("/delete-book", checkLogin, checkTeacherRole, (req,res,next)=>{
  var idBook = req.body._id;
  var id = req.body.id;
  accountModel.AccountModel.find({
    _id: id
  }).then(data=>{
    if(data.length > 0){
      accountModel.AccountModel.update({
        _id: id
      }, {
        $pull: {idBook: idBook}
      }).then(data=>{
        res.json({
          err: false,
          message: "Delete book successful"
        })
      })
    }else{
      res.json({
        err: true,
        message: "This book is not exist"
      })
    }
  })
})

router.get("/teacher", checkLogin,  (req,res,next)=>{
  accountModel.AccountModel.find({
    role: 2
  })
  .then(function(data){
    res.render("teacher", {data: data})
  })
})

router.post("/teacher", checkLogin, checkTeacherRole, (req,res,next)=>{
  res.json({
    err: false,
    message: "This is list-teacher"
  })
})

router.put("/teacher", checkLogin, checkTeacherRole, (req,res,next)=>{
  var accountStudent = {}
  var username = req.body.username
  var usernameChange = req.body.usernameChange
  var classnameChange = req.body.classnameChange
  if(usernameChange) accountStudent.username = usernameChange;
  if(classnameChange) accountStudent.class = classnameChange;
  accountModel.AccountModel.updateOne({
    username: username
  },accountStudent).then((result) => {
      res.json({
        err: false,
        message: "Update student successful"
      })
  }).catch((err) => {
    
  });
})

router.delete("/teacher", checkLogin, checkTeacherRole, (req,res,next)=>{
  var username = req.body.username
  accountModel.AccountModel.deleteOne({
    username: username
  }).then((result) => {
    res.json({
      err: false,
      message: "Delete successful"
    })
  }).catch((err) => {
    
  });
})

router.put("/book", checkLogin, checkTeacherRole, (req,res,next)=>{
  var accountBook = {};
  var id = req.body.id;
  var name = req.body.name;
  var author = req.body.author;
  if(name) accountBook.name = name;
  if(author) accountBook.author = author;
  accountModel.BookModel.updateOne({
    _id: id 
  }, accountBook).then((result) => {
    res.json({
      err: false,
      message: "Update book successful"
    })
  }).catch((err) => {
    
  });
})

var showManager = (req,res,next)=>{
  accountModel.AccountModel.find({
    role: 3
  }).then(function(data2){
    res.data2 = data2;
    next();
  })
}

router.get("/manager", checkLogin, showManager,  (req,res,next)=>{
  res.render("manager", {data: res.data2});
})
router.post("/manager", checkLogin, checkManagerRole, (req,res,next)=>{
  res.json({
    err: false,
    message: "Tao là sếp chỗ này"
  })
})

router.put("/manager", checkLogin, checkManagerRole, (req,res,next)=>{
  var accountManager = {};
  var username = req.body.username;
  var usernameChange = req.body.usernameChange;
  if(usernameChange) accountManager.username = usernameChange;
 
  accountModel.AccountModel.updateOne({
    username: username
  },accountManager).then((result) => {
    res.json({
      err: false,
      message: "Update manager successful"
    })
  }).catch((err) => {
    
  });
})

router.post("/show-book", checkLogin, (req,res,next)=>{
  var username = req.body.username;
    accountModel.AccountModel.find({
      username: username
    })
    .populate("idBook")
    .then(function(data){
      var dataBook = data[0].idBook;
      res.json({
        dataBook: dataBook
      })
    })
})

router.get("/back-teacher", checkLogin ,(req,res,next)=>{
  res.render("student", {data: res.data});
})

module.exports = router;
