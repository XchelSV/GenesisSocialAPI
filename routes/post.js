var express = require('express');
var router = express.Router();

var moment = require('moment-timezone');
var path = require('path');
var uuid = require('uuid');
var redis = require('redis');
var RedisClient = redis.createClient();
//Models Requires
var Post = require('../models/post_model');
var User = require('../models/user_model');

router.get('/api/post/img/:_id',function (request,response){
	var postId = request.params._id;
	Post.findById(postId, function (err,doc){
		response.sendFile(path.join(__dirname, '../public/img/postPhotos/'+postId+doc.ext_img));
	})
})

router.get('/api/post/:_id',function (request,response){
	var id = request.params._id;
	Post.findById(id, function (err,doc){
		response.send(doc);
	})
})

router.get('/api/post',function (request,response){
	Post.find('','',{sort:{date:-1}},function (err, docs){
		if (err) throw err;
		response.send(docs);
	});
})


router.post('/api/post/:token',function (request,response){

	var token = request.params.token;
	RedisClient.exists(token, function (err, reply){
		if(reply===1){
			var userId;
			RedisClient.get(token, function (err,value){
				userId = value;
				User.findById(userId, function (err,doc){		
					var img = false;
					var audio = false;
					var video = false;
					
					if(request.files.image != undefined){		   
						img = true;
					}
					if(request.files.video != undefined){		
						video = true;	   
					}
					if(request.files.audio != undefined){			   
						audio = true;
					}

					var ext_image = undefined;
					if(request.files.image != undefined){
						var fs = require('fs')
						var path_img = request.files.image.path;
						var is = fs.createReadStream(path_img);
						ext_image = path.extname(is.path);
					}

					var NewPost = new Post({
						user_id:userId,
						userName:doc.name,
						body:request.body.body,
						like:[],
						pray4You:[],
						date: moment().tz("America/Mexico_City").format(),
						img:img,
						audio:audio,
						video:video,
						ext_img: ext_image
					});	
					NewPost.save(function (err,save){
						if (err) throw err;
						var flag =  request.body.img;
						console.log('Flag is '+flag);
						
						if(request.files.image != undefined){	   
							console.log('Post Id: '+save._id);
							var fs = require('fs')
							var path_img = request.files.image.path;   
							var is = fs.createReadStream(path_img);
							var ext = path.extname(is.path);
							var newPath =  './public/img/postPhotos/'+save._id+ ext;
							var os = fs.createWriteStream(newPath);
							//is.pipe(imagemin({ ext: ext }))
							is.pipe(os);
							is.on('end', function() {
								//eliminamos el archivo temporal
								fs.unlinkSync(path_img);
							})
						}
						console.log('Succesfully Added Post in User '+request.body.id+' by API app');
						response.sendStatus(200);
					})
				})
			});
		} 
		else{
			response.sendStatus(404);
		}
	});
})

router.post('/api/post/like',function (request,response){
	var id = request.body.phoneId;
	var postId = request.body.postId;
	var flag = true;

	Post.findById(postId,function (err,doc){
		for (var i = 0; i < doc.like.length; i++) {
			if (id == doc.like[i]){
				flag = false;
				break;
			}
		};
		if (flag){
			Post.update({_id:postId},{$push: {'like':id}},{upsert:true},function(err){        
				if(err){
					console.log(err);
				}
				else{
					console.log("Successfully like Added from user: "+id);
					response.sendStatus(200);
				}
			})
		}
		else{
			doc.like.pull(id);
			doc.save(function (err){
				if (err) {throw err};
				console.log('Like from user '+id+' was removed')
				response.sendStatus(202);
			})
		}
	})
})

router.post('/api/post/pray',function (request,response){
	var id = request.body.phoneId;
	var postId = request.body.postId;
	var flag = true;

	Post.findById(postId,function (err,doc){
		for (var i = 0; i < doc.pray4You.length; i++) {
			if (id == doc.pray4You[i]){
				flag = false;
				break;
			}
		};
		if (flag){
			Post.update({_id:postId},{$push: {'pray4You':id}},{upsert:true},function(err){	        
				if(err){
					console.log(err);
				}
				else{
					console.log("Successfully pray4You Added from user: "+id);
					response.sendStatus(200);
				}
			})
		}
		else{
			doc.pray4You.pull(id);
			doc.save(function (err){
				if (err) {throw err};
				console.log('Pray4You from user '+id+' was removed')
				response.sendStatus(202);
			})
		}
	})
})

router.delete('/api/post/:img/:_id/:token',function (request,response){
	var id = request.params._id;
	var img = request.params.img;
	var token = request.params.token;

	RedisClient.exists(token, function (err, reply){
		if(reply===1){					
			RedisClient.get(token, function (err,userId){
						
				Post.findById(id,function (err,post){
					if (userId === post.user_id){
						Post.remove({_id:id},function (err,deleted){
							if (img === 'true' || img === true){
								console.log('its deleted from API');
								var fs = require('fs');
								fs.unlinkSync('./public/img/postPhotos/'+id+post.ext_img);
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

module.exports = router;
