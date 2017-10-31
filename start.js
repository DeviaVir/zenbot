var fs = require('fs');
require('shelljs/global');
var path = require('path');

console.log('Starting tmux session...')
var tmuxSession = exec('tmux new-session -d -s zenbots', {silent:false}).output;

console.log('Starting bots...')
var counter = 0;
 fs.readdir('config/', function(err, items) {
    for (var i=0; i<items.length; i++) {
    	if(path.extname(items[i]) === ".js") {
            var botName = items[i].slice(0, -3);
    		if(counter != 0) {
    			var newWindow = exec('tmux new-window -t zenbots:' + counter + ' -n ' + botName).output;    		
    		} else {
                var newFirstWindow = exec('tmux rename-window -t zenbots:0 ' + botName).output;
            }
			console.log('Starting bot ' + items[i])
		    var start = exec('tmux send-keys "zenbot trade --conf config/' + items[i] + '" C-m').output;
		    var rename = exec('tmux rename-window -t zenbots:' + counter + ' ' + botName).output;
		    counter++;
    	}             
    }
});

console.log('Starting monitor...')
var monitor = exec('tmux new-window -t zenbots:' + counter + ' -n livebots').output;
var startMonitor = exec('tmux send-keys "watch -n 1 'bash monitor.sh'" C-m').output;