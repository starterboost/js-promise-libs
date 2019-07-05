const Promise = require('bluebird');

function PromiseResolver(){
	this.promise = new Promise( ( resolve, reject ) => {
		this._resolve = resolve;
		this._reject = reject;
	} );
}

PromiseResolver.prototype.isFulfilled = function(){
	return this.promise.isFulfilled();
}

PromiseResolver.prototype.isPending = function(){
	return this.promise.isPending();
}

PromiseResolver.prototype.resolve = function( value ){
	if( this.isFulfilled() ) throw new Error('Already fulfilled promise');
	return this._resolve( value );
}

PromiseResolver.prototype.reject = function( err ){
	if( this.isFulfilled() ) throw new Error('Already fulfilled promise');
	return this._reject( err );
}

module.exports = PromiseResolver;