var mongoose = require('mongoose');
var User = require('./models/user_model');

var connStr = 'mongodb://localhost:27017/GenesisAPIDB';
var promise = mongoose.connect(connStr, { server: { reconnectTries: Number.MAX_VALUE } });
promise.then(
	() => { console.log('Creando Administrador') },
  	err => { console.log('Error al conectarse en la base de datos: '+err) }
);

  var newUser = new User({
          name: 'Xchel Sánchez',
          email: 'xchel@xchelsvz.me',
          password: 'pass',
          birthday: '02/04/1995',
          biography: '',
          type: true,
          servicePlace: '',
          active: true,
          url: 'https://github.com/XchelSV'
        })
  newUser.save(function(err, user){
  		if (err){
  			console.log('Error al crear Administrador')
  			throw err;
  		}	
  		else{
  			console.log('Administrador Creado')
  			mongoose.connection.close();
  		}
  })