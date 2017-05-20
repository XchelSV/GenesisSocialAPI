var express = require('express');
var router = express.Router();

var uuid = require('uuid');
var redis = require('redis');
var RedisClient = redis.createClient();
		//Models Requires
var  User = require('../models/user_model');

router.post('/api/login',function (request,response){
	
	console.log(request.body)
	User.findOne({email : request.body.email}, function (err , user){
		
		if (err) throw err;		
		if(user != undefined){
			user.comparePassword(request.body.pass, function (err , pass){
				if (err) throw err;

					if(pass){
								
						var UIDSession = uuid.v4();
						request.session._id = UIDSession;
						response.cookie('session',encodeURIComponent(request.session._id));
						RedisClient.set(UIDSession , user._id, function (err, value){
							console.log('Token de Session: '+value);
						});
						//RedisClient.expire(UIDSession,3600);
						response.send(UIDSession);
								
					}
					else{			
						response.sendStatus(404);
					}
			})
		}
		else{
			response.sendStatus(404);		
		}
	})
})
		
router.get('/api/logout/:token',function (request, response){

	var token = request.params.token;

	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			request.session.destroy(function (err){
				RedisClient.del(token, function (err,reply){
					response.sendStatus(200);
				})
			})			
		}
		else {
			response.sendStatus(401);
		}
	})
})


module.exports = router;