var express = require('express');
var router = express.Router();

var path = require('path');
var uuid = require('uuid');
var redis = require('redis');
var RedisClient = redis.createClient();
//Models Requires
var  User = require('../models/user_model');

router.post('/api/user/:token',function (request, response){

	var token = request.params.token;
	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			if (request.body.pass == request.body.pass2) {
				if (request.body.type == '0'){
					request.body.type = false;
				}
				else{
					request.body.type = true;
				}

				if (request.body.active == 'on'){
					request.body.active = true;
				}
				else{
					request.body.active = false;
				}
				var NewUser = new User({
					name: request.body.name,
					email: request.body.email,
					password: request.body.pass,
					birthday: request.body.birth,
					biography: request.body.bio,
					type: request.body.type,
					servicePlace: request.body.place,
					active: request.body.active,
					url: request.body.url
				})
				NewUser.save(function (err, user){
					if (err) {response.send('Correo Electronico ya registrado');}
					else{
						var fs = require('fs')
						var path = request.files.photo.path;
						var newPath =  './public/img/userPhotos/'+user._id+'.jpg';
						var is = fs.createReadStream(path);
						var os = fs.createWriteStream(newPath);
						is.pipe(os)
						is.on('end', function() {
							//eliminamos el archivo temporal
							fs.unlinkSync(path);
						})
						response.redirect('http://genesis.xchelsvz.me/user/list/confirmation');
					}
				})
			}
			else{
				response.send('La contraseña debe ser la misma, vuelve a ingresarla');
			}
		}
		else {
			response.sendStatus(401);
		}		
	})
})

router.post('/api/user/edit/:id/:token',function (request, response){
	var token = request.params.token;
	var user_id = request.params.id;
	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			if (request.body.type == '0'){
				request.body.type = false;
			}
			else{
				request.body.type = true;
			}

			if (request.body.active == 'on'){
				request.body.active = true;
			}
			else{
				request.body.active = false;
			}
			if (request.body.updateImg == 'on'){
				request.body.updateImg = true;
			}
			else{
				request.body.updateImg = false;
			}
			User.findById(user_id, function (err,userUpdated){
				userUpdated.name = request.body.name;
				userUpdated.email = request.body.email;
				userUpdated.birthday = request.body.birth;
				userUpdated.biography = request.body.bio;
				userUpdated.servicePlace = request.body.place;
				userUpdated.type = request.body.type;
				userUpdated.active = request.body.active;
				userUpdated.url = request.body.url;

				userUpdated.save(function (err, user){
					if (err) {response.send('Error');}
					else{
						if(request.body.updateImg){
							var fs = require('fs')
							var path = request.files.photo.path;
							var newPath =  './public/img/userPhotos/'+user._id+'.jpg';
							var is = fs.createReadStream(path);
							var os = fs.createWriteStream(newPath);
							is.pipe(os)
							is.on('end', function() {
								//eliminamos el archivo temporal
								fs.unlinkSync(path);
							})
						}
						console.log('Updated User');
						response.redirect('http://genesis.xchelsvz.me/user/list');
					}
				})
			})
		}
		else {
			response.sendStatus(401);
		}		
	})
})

router.get('/api/user',function (request, response){
	User.find('',function (err, docs){
		response.send(docs);	
	})
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

router.delete('/api/user/:_id/:token',function (request,response){
	var id = request.params._id;
	var token = request.params.token;

	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			RedisClient.get(token, function (err,userId){
				User.findById(userId, function (err,user){
					if (user.type === true){
						User.remove({_id:id},function (err,deleted){
							console.log('its deleted');
							var fs = require('fs');
							fs.unlinkSync('./public/img/userPhotos/'+id+'.jpg');
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
