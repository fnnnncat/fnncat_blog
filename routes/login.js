var express=require('express');
var router=express.Router();

router.get('/',function(req,res,nex){
   console.log("--------");
   res.render('login',{time:new Date()})
})

module.exports=router;