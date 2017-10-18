var fs = require('fs');
require('shelljs/global');
var path = require('path');

console.log('Starting tmux session...')
var tmuxSession = exec('tmux new-session -d -s zenbots', {silent:false}).output;

console.log('Starting bots...')
 fs.readdir('config/', function(err, items) {
 	var counter = 0;
    for (var i=0; i<items.length; i++) {
    	if(path.extname(items[i]) === ".js") {
    		if(counter != 0) {
    			var newWindow = exec('tmux new-window -t zenbots:' + counter + ' -n livebots').output;    		
    		} else {
                var newFirstWindow = exec('tmux rename-window -t zenbots:0 ' + items[i]).output;
            }
			console.log('Starting tmux window for ' + items[i])
		    var start = exec('tmux send-keys "zenbot trade --conf config/' + items[i] + '" C-m').output;
		    var rename = exec('tmux rename-window -t zenbots:' + counter + ' ' + items[i]).output;
		    counter++;
    	}             
    }
});