const {PromiseQueue} = require('../index');
const util = require('util');
const assert = require('assert');
const sinon = require('sinon');
const Promise = require('bluebird');
const _ = require('lodash');

describe('PromiseQueue', function(){
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
					console.log('Check factory and resolver')
					assert.ok( callOnResolver.calledWith( result ), 'Resolver did not receive the correct data' );
					assert.ok( callOnFactory.calledWith( result ), 'Factory did not receive the correct data' );
				} );

				done();
			} );
		} );
	});

});