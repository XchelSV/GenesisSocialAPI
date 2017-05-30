var express = require('express');
var router = express.Router();

var moment = require('moment-timezone');
var path = require('path');
var redis = require('redis');
var RedisClient = redis.createClient();

//Models Requires
var Place = require('../models/place_model');
var  User = require('../models/user_model');

router.post('/api/place',function (request,response){
	var newPlace = new Place({
		_id:request.body.place_id,
		location:request.body.location,
		formatted_address:request.body.formatted_address
	})
	console.log(newPlace);
	newPlace.save(function (err,saved){
		response.sendStatus(200);
	})
})

router.get('/api/place',function (request,response){
	Place.find('','',function (err,docs){
		response.send(docs);
	})
})

router.get('/api/users/place/:_placeId',function (request,response){
	var id = request.params._placeId;
	Place.findById(id, function (err, place){			
		User.find({servicePlace: place.formatted_address},function (err, users){
			response.send(users);
		})
	})
})

router.delete('/api/place/:id/:token',function (request,response){
	var token = request.params.token;
	var id = request.params.id;
	RedisClient.exists(token, function (err, reply){
		if(reply===1){					
			RedisClient.get(token, function (err,userId){
				User.findById(userId,function (err,user_found){	
					if (user_found.type === true){
						Place.remove({_id:id},function (err,deleted){
							response.sendStatus(200);
						})
					}
					else{
						response.sendStatus(401);
					}
				})
			})
		}
		else{
			response.sendStatus(401);
		}
	})
})

module.exports = router;
