const Promise = require('bluebird');

function PromiseResolver( options = {} ){
	this.throwIfFulfilled = options.throwIfFulfilled == false ? false : true;

	this.promise = new Promise( ( resolve, reject ) => {
		this._resolve = resolve;
		this._reject = reject;
	} );

	this.completed = false;
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
	if(!this.completed){
		this.completed = true;
		return this._resolve( value );
	}
}

PromiseResolver.prototype.reject = function( err ){
	//only throw if told to throw
	if( this.throwIfFulfilled && this.isFulfilled() ) throw new Error('Already fulfilled promise');
	//if pending then reject the promose - otherwise create new
	if(!this.completed){
		this.completed = true;
		return this._reject( err );
	}
}

PromiseResolver.prototype.finally = function( promise ){
	return this.promise.finally( promise );
}

module.exports = PromiseResolver;