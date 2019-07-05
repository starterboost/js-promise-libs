const Promise = require('bluebird');
const assert = require('assert');
const util = require('util');
const PromiseResolver = require('./promise-resolver');

function PromiseQueue( factory, options = {} ){
	assert.ok( util.isFunction( factory ), 'PromiseQueue requires a factory' );

	this.factory = factory;
	this.processing = [];
	this.queue = [];
	this.limit = options.limit || 1;
}

PromiseQueue.prototype.add = function( data ){
	const resolver = new PromiseResolver();
	resolver.data = data;
	//add to the queue
	this.queue.push( resolver );
	//after a delay, call this.next
	this.next( 1 );
	//return the promise
	return resolver.promise;
}

PromiseQueue.prototype.next = function( delay = 0 ){
	if( delay > 0 ){
		Promise.delay( delay ).then( () => this.next() );
	}else{
		//if the processing list is smaller than allowed - add the next resolver from the queue
		if( this.processing.length <  this.limit  && this.queue.length > 0 ){
			//take the next item in the queue
			const resolver = this.queue.shift();
			//add to the list of processing promises so another isn't processed when next is called again
			this.processing.push( resolver );
			//ask the factory to handle the queued request
			const request = this.factory( resolver.data );
			//add handlers to the request so that we know when it has completed
			request.then(
				( result ) => {
					//this resolver can be removed from the queue
					RemoveItem( this.processing, resolver );
					//call for the next item to be handled
					this.next(1);
					//pass the result to the resolver
					resolver.resolve( result );
				},
				( err ) => {
					//this resolver can be removed from the queue
					RemoveItem( this.processing, resolver );
					//call for the next item to be handled
					this.next(1);
					//pass the error to the resolver
					resolver.reject( err );
				}
			);
		}
	}
}

//HELPER
function RemoveItem( arr, item ){
	const index = arr.indexOf( item );
	if( index > -1 ){
		arr.splice( index, 1 );
	}else{
		throw new Error('Item not found in array');
	}
}

module.exports = PromiseQueue;