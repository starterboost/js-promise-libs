const _ = require('lodash');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;
const assert = require('assert');
const util = require('util');
const PromiseResolver = require('./promise-resolver');

function PromiseQueue( factory, options = {} ){
	assert.ok( util.isFunction( factory ), 'PromiseQueue requires a factory' );

	this.factory = factory;
	this.processing = [];
	this.queue = [];
	this.limit = options.limit || 1;
	this.timeout = options.timeout;
	this.isEmpty = true;
}

util.inherits( PromiseQueue, EventEmitter );

PromiseQueue.prototype.add = function( data ){
	const resolver = new PromiseResolver({throwIfFulfilled:false});
	resolver.data = data;
	//add to the queue
	this.queue.push( resolver );
	this.isEmpty = false;
	//after a delay, call this.next
	this.next( 1 );
	//take into account the timeout if it is in place
	if( util.isNumber( this.timeout ) ){
		Promise.delay( this.timeout ).then( () => {
			resolver.reject( 'Promise timeout' );
		} );
	}
	//return the promise
	return resolver.promise;
}

PromiseQueue.prototype.next = function( delay = 0 ){
	if( delay > 0 ){
		Promise.delay( delay ).then( () => this.next() );
	}else{
		//if the processing list is smaller than allowed - add the next resolver from the queue
		if( this.queue.length > 0 ){
			//check that we're allowed to accept any more processes
			if( this.processing.length < this.limit ){
				//take the next item in the queue
				const resolver = this.queue.shift();
				if( resolver.isPending() ){
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
				}else{
					//call the next
					this.next();
				}
			}
		}else if( !this.isEmpty ){
			this.isEmpty = true;
			this.emit('drained');
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