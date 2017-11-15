#!/bin/bash

# Author: Tasos Latsas

# spinner.sh
#
# Display an awesome 'spinner' while running your long shell commands
#
# Do *NOT* call _spinner function directly.
# Use {start,stop}_spinner wrapper functions

# usage:
#   1. source this script in your's
#   2. start the spinner:
#       start_spinner [display-message-here]
#   3. run your command
#   4. stop the spinner:
#       stop_spinner [your command's exit status]
#
# Also see: test.sh


function _spinner() {
    # $1 start/stop
    #
    # on start: $2 display message
    # on stop : $2 process exit status
    #           $3 spinner function pid (supplied from stop_spinner)

    local on_success="DONE"
    local on_fail="FAIL"
    local white="\e[1;37m"
    local green="\e[1;32m"
    local red="\e[1;31m"
    local nc="\e[0m"

    case $1 in
        start)
            # calculate the column where spinner and status msg will be displayed
            let column=$(tput cols)-${#2}-8
            # display message and position the cursor in $column column
            echo -ne ${2}
            printf "%${column}s"

            # start spinner
            i=1
            sp='\|/-'
            delay=${SPINNER_DELAY:-0.15}

            while :
            do
                printf "\b${sp:i++%${#sp}:1}"
                sleep $delay
            done
            ;;
        stop)
            if [[ -z ${3} ]]; then
                echo "spinner is not running.."
                exit 1
            fi

            kill $3 > /dev/null 2>&1

            # inform the user uppon success or failure
            echo -en "\b["
            if [[ $2 -eq 0 ]]; then
                echo -en "${green}${on_success}${nc}"
            else
                echo -en "${red}${on_fail}${nc}"
            fi
            echo -e "]"
            ;;
        *)
            echo "invalid argument, try {start/stop}"
            exit 1
            ;;
    esac
}

function start_spinner {
    # $1 : msg to display
    _spinner "start" "${1}" &
    # set global spinner pid
    _sp_pid=$!
    disown
}
function stop_spinner {
    # $1 : command exit status
    _spinner "stop" $1 $_sp_pid
    unset _sp_pid
}


start_spinner
echo 'INSTALLING STARTS HERE'
echo 'Adding repository, please be patient... This entire process can take 30 minutes.'
sudo add-apt-repository ppa:ubuntu-toolchain-r/test -y > install.log
echo 'Updating apt, please be patient...'
sudo apt-get update > install.log
echo 'Installing gcc-4.9, mongodb, build-essential, please be patient!'
sudo apt-get install gcc-4.9 mongodb build-essential -y > install.log
echo 'Upgrading libstdc++6 for napajs node threading... please wait!'
sudo apt-get upgrade libstdc++6 > install.log
echo 'Downloading nodejs 7, please wait!'
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash - > install.log
echo 'Installing nodejs, please wait!'
sudo apt-get install -y nodejs > install.log
echo 'Removing any old node modules, please be patient!'
sudo rm -rf node-modules/ > install.log
echo 'Lastly, installing zenbot, please be patient!!! Almost done!'
npm install > install.log
echo 'Zenbot has been installed, thanks for being patient, to run type: ./zenbot.sh --help'
echo 'INSTALLING STOPS HERE'
stop_spinner
