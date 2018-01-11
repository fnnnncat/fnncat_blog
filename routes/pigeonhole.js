var express = require('express');
var router = express.Router();
var PigeonholeModel = require('../models/pigeonhole');

router.get('/', function(req, res, next) {
  var author = req.query.author;
  var page =req.query.page;

  Promise.all([
    PigeonholeModel.getpigeList(),
  ])
  .then(function (result) {
    var posts = result[0];

    res.render('pigeonhole', {
      posts: posts,
    });
  })
  .catch(next);
});

module.exports = router;
