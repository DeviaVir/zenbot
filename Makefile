# Check if this is Windows
ifneq (,$(findstring WINDOWS,$(PATH)))
WINDOWS := True
endif

# Set shell to cmd on windows
ifdef WINDOWS
SHELL := C:/Windows/System32/cmd.exe
endif

# Don't use sudo on windows
SUDO := "sudo"
ifdef WINDOWS
SUDO := 
endif

# set home dir to user's home on windows running MINGW
ifdef MSYSTEM
HOME := $(subst \,/,$(HOME))
endif

# Get the root dir of this file
ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

# Define the full path to this file
THIS_FILE := $(lastword $(MAKEFILE_LIST))

# Set docker-compose file selector for windows
ifneq (,$(findstring WINDOWS,$(PATH)))
DC_CONFIG=$(ROOT_DIR)/docker-compose-windows.yml
else
DC_CONFIG=$(ROOT_DIR)/docker-compose.yml
endif

# Find or create a home for sensitive environment variables
# Check my secret place
CREDS=$(HOME)/.bash/.credentials
ifneq ("$(wildcard $(CREDS))","")
CREDENTIALS := $(CREDS)
else
# Check a normal place
CREDS=$(HOME)/.credentials
ifneq ("$(wildcard $(CREDS))","")
CREDENTIALS := $(CREDS)
else
$(info $(shell "mkdir" $(CREDS)))
endif
endif

# To use arguments with make execute: make -- <command> <args>
ARGS = $(filter-out $@,$(MAKECMDGOALS))
MAKEFLAGS += --silent

list:
	sh -c "echo; $(MAKE) -p no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile'| sort"

#############################
# ZENBOT
#############################

list-strategies:
	docker-compose exec server zenbot list-strategies $(ARGS)

list-selectors:
	docker-compose exec server zenbot list-selectors $(ARGS)

backfill:
	docker-compose exec server zenbot backfill $(ARGS)

sim:
	docker-compose exec server zenbot sim $(ARGS)

trade:
	docker-compose exec server zenbot trade $(ARGS)

paper:
	docker-compose exec server zenbot trade --paper $(ARGS)

balance:
	docker-compose exec server zenbot balance $(ARGS)

buy:
	docker-compose exec server zenbot buy $(ARGS)

sell:
	docker-compose exec server zenbot sell $(ARGS)

zenbot:
	docker-compose exec server zenbot $(ARGS)

#############################
# Docker machine states
#############################
time-sync:
	docker run --rm --privileged alpine hwclock -s

up:
	$(SUDO) docker-compose --file=$(DC_CONFIG) up

start:
	docker-compose start

stop:
	docker-compose stop

state:
	docker-compose ps

rebuild:
	$(SUDO) docker-compose stop
	$(SUDO) docker-compose pull
	$(SUDO) docker-compose rm --force server
	$(SUDO) docker-compose rm --force mongodb
	-$(SUDO) docker-compose rm --force adminmongo
	$(SUDO) docker-compose build --no-cache
	$(SUDO) docker-compose --file=$(DC_CONFIG) up -d --force-recreate


shell:
	docker-compose exec server /bin/sh

shellw:
	docker exec -it -u root $$(docker-compose ps -q server) /bin/sh

logs:
	docker-compose logs $(ARGS)

#############################
# Argument fix workaround
#############################
%:
	@:
