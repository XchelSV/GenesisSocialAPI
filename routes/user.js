var express = require('express');
var router = express.Router();

var path = require('path');
var uuid = require('uuid');
var redis = require('redis');
var RedisClient = redis.createClient();
//Models Requires
var  User = require('../models/user_model');

router.get('/api/user/:token',function (request, response){

	var token = request.params.token;
	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			User.find('',function (err, docs){
				if (err) throw err;
				console.log(docs);
				response.send(docs);	
			})
		}
		else {
			response.sendStatus(401);
		}		
	});
})

router.get('/api/user/profile/:_userid',function (request,response){
	var user_id = request.params._userid;
	User.findById(user_id, function (err,user){
		if (err) {
			response.sendStatus(404);
		}
		else{
			response.send(user);
		}
	})
})

router.get('/api/user/img/:_id',function (request,response){
	var userId = request.params._id;
	response.sendFile(path.join(__dirname, '../public/img/userPhotos/'+userId+'.jpg'));
})

module.exports = router;
