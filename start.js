// Type "Hello World" then press enter.
var robot = require("robotjs");
var fs = require('fs');
require('shelljs/global');
var path = require('path');

var screen = exec('screen -d -m -S zenbots', {silent:false}).output;

 fs.readdir('config/', function(err, items) {
 	var counter = 0;
    for (var i=0; i<items.length; i++) {
    	if(path.extname(items[i]) === ".js") {
    		if(counter != 0) {
    			var newWindow = exec('screen -S zenbots -X screen').output;    		
    		}
			console.log('Starting screen window for ' + items[i])
		    var window = exec('screen -S zenbots -p ' + counter + ' -X cd ~/repos/zenbot').output;
		    var trade = exec('screen -S zenbots -p ' + counter + ' -X exec zenbot trade --conf config/' + items[i]).output;
		    counter++;
    	}             
    }
});