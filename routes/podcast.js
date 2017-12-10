var express = require('express');
var router = express.Router();

var moment = require('moment-timezone');
var path = require('path');
var redis = require('redis');
var RedisClient = redis.createClient();

//Models Requires
var Podcast = require('../models/podcast_model');
var User = require('../models/user_model');


router.get('/api/podcast',function (request,response){
    var newDate = new Date();
    Podcast.find({showDate:{$lt: newDate}},'',{sort:{showDate:-1}},function (err,docs){
        response.send(docs);
    })
})

router.get('/api/podcast/:token',function (request,response){
    var token = request.params.token;
    RedisClient.exists(token, function (err, reply){
        if(reply===1){
            Podcast.find({},'',{sort:{showDate:-1}},function (err,docs){
                response.send(docs);
            })
        }
        else{
            response.sendStatus(404);
        }
    })
})

router.get('/api/podcast/audio/:_id',function (request,response){
    var podcastId = request.params._id;  
    response.sendFile(path.join(__dirname, '../public/audio/podcastAudios/'+podcastId+'.mp3'));
})

router.post('/api/podcast/:token',function (request,response){
    var token = request.params.token;
    RedisClient.exists(token, function (err, reply){
        if(reply===1){
            var date = new Date();
            var audio = false;      

            if(request.files.audio != undefined){                  
                audio = true;
            }
            var newPodcast = new Podcast({
                title:request.body.title,
                body:request.body.body,
                date:date,
                showDate:request.body.showDate,
                audio:audio,
            })
            newPodcast.save(function (err,saved){
                if (err) throw err;
                
                if(audio){
                    var fs = require('fs')
                    var path_audio = request.files.audio.path;
                    var newPath =  './public/audio/podcastAudios/'+saved._id+'.mp3';
                    var is = fs.createReadStream(path_audio);
                    var os = fs.createWriteStream(newPath);
                    is.pipe(os)
                    is.on('end', function() {
                        //eliminamos el archivo temporal
                        fs.unlinkSync(path_audio);
                    })
                }
                
                console.log('Podcast saved by API App: '+saved._id);
                response.sendStatus(200);
            })
        }
        else{
            response.sendStatus(404);
        }
    })
})


router.delete('/api/podcast/:_id/:token',function (request,response){
    var id = request.params._id;
    var audio = request.params.audio;
    var token = request.params.token;

    RedisClient.exists(token, function (err, reply){
        if(reply===1){
            RedisClient.get(token, function (err,userId){
                User.findById(userId, function (err,user){
                    if (user.type === true){
                        Podcast.remove({_id:id},function (err,deleted){
                            
                            var fs = require('fs');
                            fs.unlinkSync('./public/audio/podcastAudios/'+id+'.mp3');                            
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
