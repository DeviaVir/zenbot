ARGS = $(filter-out $@,$(MAKECMDGOALS))
MAKEFLAGS += --silent

list:
	sh -c "echo; $(MAKE) -p no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile'| sort"

#############################
# ZENBOT
#############################

list-strategies:
	sudo docker-compose exec server zenbot list-strategies $(ARGS)

list-selectors:
	sudo docker-compose exec server zenbot list-selectors $(ARGS)

backfill:
	sudo docker-compose exec server zenbot backfill $(ARGS)

sim:
	sudo docker-compose exec server zenbot sim $(ARGS)

trade:
	sudo docker-compose exec server zenbot trade $(ARGS)

paper:
	sudo docker-compose exec server zenbot trade --paper $(ARGS)

balance:
	sudo docker-compose exec server zenbot balance $(ARGS)

buy:
	sudo docker-compose exec server zenbot buy $(ARGS)

sell:
	sudo docker-compose exec server zenbot sell $(ARGS)

zenbot:
	sudo docker-compose exec server zenbot $(ARGS)

#############################
# Docker machine states
#############################

up:
	sudo docker-compose up -d

start:
	sudo docker-compose start

stop:
	sudo docker-compose stop

state:
	sudo docker-compose ps

rebuild:
	sudo docker-compose stop
	sudo docker-compose pull
	sudo docker-compose rm --force server
	sudo docker-compose rm --force mongodb
	sudo docker-compose rm --force adminmongo
	sudo docker-compose build --no-cache
	sudo docker-compose up -d --force-recreate

shell:
	sudo docker-compose exec server /bin/sh

shellw:
	docker exec -it -u root $$(docker-compose ps -q server) /bin/sh

logs:
	sudo docker-compose logs $(ARGS)

#############################
# Argument fix workaround
#############################
%:
	@:
