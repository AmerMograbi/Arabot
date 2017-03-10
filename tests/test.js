/*jshint esversion: 6 */

class Test{
	runTests (){
		const tests = Object.getOwnPropertyNames( Object.getPrototypeOf(this) );
    	for (let test of tests) {
    		if(test != 'constructor')
    			this[test]();
    	}

	}	
}


module.exports = Test;
