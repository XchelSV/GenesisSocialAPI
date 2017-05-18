var express = require('express');
var router = express.Router();

var moment = require('moment-timezone');
var path = require('path');
var redis = require('redis');
var RedisClient = redis.createClient();

//Models Requires
var Place = require('../models/place_model');

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

module.exports = router;
