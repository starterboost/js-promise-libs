const {PromiseResolver} = require('../index');
const util = require('util');
const assert = require('assert');
const Promise = require('bluebird');

describe('PromiseResolver', function(){
	it('Should provide constructor', () => {
		assert.ok( util.isFunction(PromiseResolver) );
	});

	it('Should create new test without resolving', ( done ) => {
		const resolver = new PromiseResolver();

		resolver.promise.then(
			() => done(`Shouldn't resolve`),
			done
		)
		.timeout( 500 )
		.catch( () => {
			//assert that it's still pending
			assert.equal( resolver.isPending(), true, 'Should be pending' );
			assert.equal( resolver.isFulfilled(), false, 'Should not be fulfilled' );
			//done
			done();
		} );
	});
	
	it('Should resolve on command', ( done ) => {
		const resolver = new PromiseResolver();

		resolver.promise.then(
			() => {
				//assert that it's still pending
				assert.equal( resolver.isPending(), false, 'Should not be pending' );
				assert.equal( resolver.isFulfilled(), true, 'Should be fulfilled' );
				//done
				done();
			},
			done
		);

		Promise.delay( 500 ).then( () => {
			resolver.resolve();
		} );
	});
	
	it('Should reject on command', ( done ) => {
		const resolver = new PromiseResolver();
		const errMessage = 'This failed!';

		resolver.promise
		.then(
			() => done('Should have rejected'),
			(err) => {
				//assert
				assert.equal( err, errMessage, 'Error message did not match' );
				//done
				done();
			},
		);

		Promise.delay( 500 ).then( () => {
			resolver.reject( errMessage );
		} );
	});
});