#### Using Docker

To run Zenbot under Docker, install Docker, Docker Compose, Docker Machine (if necessary).
You can follow instructions at https://docs.docker.com/compose/install/.

After [installing Zenbot](README.md):
```
cd zenbot
docker-compose up    # -d if you don't want to see the log
```

If you are running Windows use the following command:
```
docker-compose --file=docker-compose-windows.yml up
```

If you wish to run commands (e.g. backfills, list-selectors), you can run this separate command after a successful `docker-compose up -d`:
```
docker-compose exec server zenbot list-selectors
docker-compose exec server zenbot backfill <selector> --days <days>
```

#### Updating Docker

In case you are behind on updates, you can run:
```
docker pull deviavir/zenbot:unstable
```

And re-run `docker-compose up -d` to start the new image.

`deviavir/zenbot` is automatically updated after every merge.
You can follow the tags/builds at https://hub.docker.com/r/deviavir/zenbot/builds/.
