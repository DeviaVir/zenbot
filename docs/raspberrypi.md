(I'm running it on a Raspberry Pi 3 with Raspbian Stretch)

**1. Install nodejs.** 
http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/

**2. Install docker and docker-compose.**
Docker:
https://blog.alexellis.io/getting-started-with-docker-on-raspberry-pi/
Docker-compose instructions at the end of this page:
https://pixelchrome.org/blog/quickstart-guide-how-to-install-docker-a-raspberry-pi/

**3. Install this or another mongodb dockerfile made for the rapsberry pi.**
https://hub.docker.com/r/nonoroazoro/rpi-mongo/

**4.Rename the mongodb dockerfile to "mongo"** so that the conf.js from zenbot works with it.
In my case:
`docker tag nonoroazoro/rpi-mongo:latest mongo:latest`

**5.Run the mongo dockerfile.**
`docker run mongo`
(You can control-c or command-c to close the dialogue after it stays at "waiting for connections on port 27017") 
`docker ps`
to make sure mongo is running

**6. Run zenbot.**
`cd zenbot`
`docker-compose build`
`docker-compose up -d`

Commands are the same
`docker run --rm --link zenbot_mongodb_1:mongodb -it zenbot_server ./zenbot.sh [command]`


There ya go
