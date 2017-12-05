var express = require('express');
var router = express.Router();

var moment = require('moment-timezone');
var path = require('path');
var redis = require('redis');
var RedisClient = redis.createClient();

//Models Requires
var Devotional = require('../models/devotional_model');
var User = require('../models/user_model');


router.get('/api/devotional',function (request,response){
	var newDate = new Date();
	Devotional.find({showDate:{$lt: newDate}},'',{sort:{showDate:-1}},function (err,docs){
		response.send(docs);
	})
})

router.get('/api/devotional/img/:_id',function (request,response){
	var devotionalId = request.params._id;	
	response.sendFile(path.join(__dirname, '../public/img/devotionalPhotos/'+devotionalId+'.jpg'));
})

router.get('/api/devotional/audio/:_id',function (request,response){
	var devotionalId = request.params._id;	
	response.sendFile(path.join(__dirname, '../public/audio/devotionalAudios/'+devotionalId+'.mp3'));
})

router.get('/api/devotional/video/:_id',function (request,response){
	var devotionalId = request.params._id;	
	response.sendFile(path.join(__dirname, '../public/video/devotionalVideos/'+devotionalId+'.mp4'));
})

router.post('/api/devotional/:token',function (request,response){
	var token = request.params.token;
	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			var date = new Date();
			var img = false;
			var video = false;
			var audio = false;		
			if(request.files.img != undefined){				   
				img = true;
			}
			if(request.files.video != undefined){			
				video = true;	   
			}
			if(request.files.audio != undefined){				   
				audio = true;
			}
			var newDevotional = new Devotional({
				title:request.body.title,
				body:request.body.body,
				date:date,
				showDate:request.body.showDate,
				img:img,
				audio:audio,
				video:video
			})
			newDevotional.save(function (err,saved){
				if (err) throw err;
				if(img){
					var fs = require('fs')
					var path = request.files.img.path;
					var newPath =  './public/img/devotionalPhotos/'+saved._id+'.jpg';
					var is = fs.createReadStream(path);
					var os = fs.createWriteStream(newPath);
					is.pipe(os)
					is.on('end', function() {
						//eliminamos el archivo temporal
						fs.unlinkSync(path);
					})
				}
				if(audio){
					var fs = require('fs')
					var path_audio = request.files.audio.path;
					var newPath =  './public/audio/devotionalAudios/'+saved._id+'.mp3';
					var is = fs.createReadStream(path_audio);
					var os = fs.createWriteStream(newPath);
					is.pipe(os)
					is.on('end', function() {
						//eliminamos el archivo temporal
						fs.unlinkSync(path_audio);
					})
				}
				if(video){
					var fs = require('fs')
					var path_video = request.files.video.path;
					var newPath =  './public/video/devotionalVideos/'+saved._id+'.mp4';
					var is = fs.createReadStream(path_video);
					var os = fs.createWriteStream(newPath);
					is.pipe(os)
					is.on('end', function() {
						//eliminamos el archivo temporal
						fs.unlinkSync(path_video);
					})
				}
				console.log('Devotional saved by API App: '+saved._id);
				response.sendStatus(200);
			})
		}
		else{
			response.sendStatus(404);
		}
	})
})

router.put('/api/devotional/:id/:token',function (request,response){
	var token = request.params.token;
	var devotionalId = request.params.id;
	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			var date = new Date();
			var img = false;
			var video = false;
			var audio = false;		
			if(request.files.img != undefined){				   
				img = true;
			}
			if(request.files.video != undefined){			
				video = true;	   
			}
			if(request.files.audio != undefined){				   
				audio = true;
			}
			Devotional.findById(devotionalId, function (err,updatedDevotional){			
				
				updatedDevotional.title = request.body.title;
				updatedDevotional.body = request.body.body;
				updatedDevotional.date = date;
				updatedDevotional.showDate = request.body.showDate;
				if(img){
					updatedDevotional.img = img;
				}
				if(video){
					updatedDevotional.video = video;
				}
				if(audio){
					updatedDevotional.audio = audio;
				}
				
				updatedDevotional.save(function (err,saved){
					if (err) throw err;
					if(img){
						var fs = require('fs')
						var path = request.files.img.path;
						var newPath =  './public/img/devotionalPhotos/'+saved._id+'.jpg';
						var is = fs.createReadStream(path);
						var os = fs.createWriteStream(newPath);
						is.pipe(os)
						is.on('end', function() {
							//eliminamos el archivo temporal
							fs.unlinkSync(path);
						})
					}
					if(audio){
						var fs = require('fs')
						var path_audio = request.files.audio.path;
						var newPath =  './public/audio/devotionalAudios/'+saved._id+'.mp3';
						var is = fs.createReadStream(path_audio);
						var os = fs.createWriteStream(newPath);
						is.pipe(os)
						is.on('end', function() {
							//eliminamos el archivo temporal
							fs.unlinkSync(path_audio);
						})
					}
					if(video){
						var fs = require('fs')
						var path_video = request.files.video.path;
						var newPath =  './public/video/devotionalVideos/'+saved._id+'.mp4';
						var is = fs.createReadStream(path_video);
						var os = fs.createWriteStream(newPath);
						is.pipe(os)
						is.on('end', function() {
							//eliminamos el archivo temporal
							fs.unlinkSync(path_video);
						})
					}
					console.log('Devotional Updated by API App: '+saved._id);
					response.sendStatus(200);
				})
			})
		}
		else{
			response.sendStatus(404);
		}
	})
})

router.get('/api/devotional/:_id',function (request,response){
	var devotionalId = request.params._id;
	Devotional.findById(devotionalId, function (err,doc){			
		response.send(doc);
	})
})

router.delete('/api/devotional/:_id/:img/:audio/:video/:token',function (request,response){
	var id = request.params._id;
	var img = request.params.img;
	var audio = request.params.audio;
	var video = request.params.video;
	var token = request.params.token;

	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			RedisClient.get(token, function (err,userId){
				User.findById(userId, function (err,user){
					if (user.type === true){
						Devotional.remove({_id:id},function (err,deleted){
							if (img === 'true' || img === true){
								console.log('its deleted');
								var fs = require('fs');
								fs.unlinkSync('./public/img/devotionalPhotos/'+id+'.jpg');
							}
							if (audio === 'true' || audio === true){
								console.log('its deleted');
								var fs = require('fs');
								fs.unlinkSync('./public/audio/devotionalAudios/'+id+'.mp3');
							}
							if (video === 'true' || video === true){
								console.log('its deleted');
								var fs = require('fs');
								fs.unlinkSync('./public/video/devotionalVideos/'+id+'.mp4');
							}
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

router.get('/api/devotional/:date/:token',function (request,response){
	var token = request.params.token;
	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			var newDate = new Date(request.params.date);
			Devotional.find({showDate:{$lt: newDate}},'',{sort:{date:-1}},function (err,docs){
				console.log('Numero de Devocionales Enviados '+docs.length)
				response.send(docs);
			})
		}
		else{
			response.sendStatus(404);
		}
	})
})



module.exports = router;
