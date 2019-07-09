const {PromiseQueue} = require('../index');
const util = require('util');
const assert = require('assert');
const sinon = require('sinon');
const Promise = require('bluebird');
const _ = require('lodash');

describe('PromiseQueue', function(){
	this.timeout(10000);

	it('Should provide constructor', () => {
		assert.ok( util.isFunction(PromiseQueue) );
	});
	
	it('Should NOT initialise without a factory', () => {
		assert.throws( () => {
			return new PromiseQueue();
		}, Error );
	});
	
	it('Should initialise with a factory', ( done ) => {
		const resolver = sinon.spy( function( data ){
			return data;
		} );
		
		const factory = sinon.spy( function( data ){
			return Promise.delay( 500, data );
		} );

		const queue = new PromiseQueue( factory );

		assert.doesNotThrow( () => {
			//create the queue
			const queue = new PromiseQueue( factory );
			return Promise.all([
				queue.add( {id:0} ).then( resolver ),
				queue.add( {id:1} ).then( resolver )
			]).then( ( results ) => {
				//verify that we got what we expected
				assert.equal( results.length, resolver.callCount );
				assert.equal( results.length, factory.callCount );
				
				//run through the results and check there is a match
				_.each( results, (result, index) => {
					const callOnResolver = resolver.getCall( index );
					const callOnFactory = factory.getCall( index );
					
					assert.ok( callOnResolver.calledWith( result ), 'Resolver did not receive the correct data' );
					assert.ok( callOnFactory.calledWith( result ), 'Factory did not receive the correct data' );
				} );

				done();
			} );
		} );
	});

	it('Should tear down a promise if it times out', function( done ){
		this.timeout(10000);

		const resolver = sinon.spy( function( data ){
			return data;
		} );
		
		const rejector = sinon.spy( function( data ){
			return data;
		} );
		
		const factory = sinon.spy( function( data ){
			return Promise.delay( 50, data );
		} );

		const numItems = 10;
		const queue = new PromiseQueue( factory, {timeout:10} );
		const items = _.times(numItems, function(){
			return queue.add( {id:0} ).then( resolver, rejector );
		});

		queue.on('drained', function(){
			Promise.resolve()
			.then( () => {
				//we should have completed the queue
				assert.equal( resolver.callCount, 0 );
				assert.equal( factory.callCount, 1 );
				assert.equal( rejector.callCount, numItems );
				assert.equal( queue.queue.length, 0 );
			} )
			.then(
				done,
				done
			);
		});
	});

});