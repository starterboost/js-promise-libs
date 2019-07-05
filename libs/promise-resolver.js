const Promise = require('bluebird');

function PromiseResolver( options = {} ){
	this.throwIfFulfilled = options.throwIfFulfilled == false ? false : true;

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
	//only throw if told to throw
	if( this.throwIfFulfilled && this.isFulfilled() ) throw new Error('Already fulfilled promise');
	//if pending then resolve the promose - otherwise create new
	return this.isPending() ? this._resolve( value ) : Promise.resolve( value );
}

PromiseResolver.prototype.reject = function( err ){
	//only throw if told to throw
	if( this.throwIfFulfilled && this.isFulfilled() ) throw new Error('Already fulfilled promise');
	//if pending then reject the promose - otherwise create new
	return this.isPending() ? this._reject( err ) : Promise.reject( err );
}

module.exports = PromiseResolver;