var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  var author = req.query.author;
  var page =req.query.page;

  res.render('friendlink',{});
});

module.exports = router;
