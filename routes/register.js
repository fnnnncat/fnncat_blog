
var express = require('express');
var router = express.Router();
var crypto = require('crypto'),
    User = require('../models/users.js');

router.get('/',function(req,res,nex){
   console.log("--------");
   res.render('register',{time:new Date()})
})
router.post('/reg', function (req, res) {
 
  var name = req.body.name,
      password = req.body.password;
  console.log(req.body);
  var newUser = new User({
      name: name,
      password: password
  });
  var faildata={
       returnMessage:"you failed!",
       returnCode:"-9999"
  }
  var haveduser={
      returnMessage:"haved userName",
      returnCode:"-9999"
  }
 var successdata={
       returnMessage:"you register!",
       returnCode:"0"
  }
  //检查用户名是否已经存在 
 
  User.get(newUser.name, function (err, user) {
    if (err) {
     
     res.json(faildata);
    }
    if (user) {
       res.json(haveduser);
    }
    //如果不存在则新增用户
    newUser.save(function (err, user) {
      if (err) {
        res.json(faildata);
      }
       res.json(successdata);
    });
  });
});
module.exports = router;