var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


    //Schema Definition
    var PodcastSchema = new Schema({
        
    	title:{type:String},
        body:{type:String},
        date:{type:Date},
        showDate:{type:Date},
        audio:{type:Boolean}

    })

module.exports = mongoose.model('Podcast', PodcastSchema);