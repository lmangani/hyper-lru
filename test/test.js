const HyperLRU = require('../index.js');
const lru = new HyperLRU({maxSize: 1000, hyper: 'mysupersecretlonghash' });

const testme = function(){
	console.log('testing...')
	var value = Math.random().toString(36).substring(7);
	var key = Math.random().toString(36).substring(7);
	lru.set(key,value );
	console.log(lru.size);
}

setInterval(testme, 5000);
