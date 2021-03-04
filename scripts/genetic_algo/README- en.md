## Genetic Algorithm by @arpheno

For context:
- #298 https://github.com/carlos8f/zenbot/issues/298
- the original PR: https://github.com/carlos8f/zenbot/pull/299
- merged PR https://github.com/carlos8f/zenbot/pull/598
- please note that the code has decayed and you may encounter weird things

On your host:
```
$ docker-compose up
$ docker-compose exec server bash
```

On docker host (or without docker):
```
$ fab backfill_local:<days>
$ cd scripts/genetic_algo
$ python -m scoop main.py <product> <days> <individuals> <strategy>
```

example:
```
$ fab backfill_local:5
$ cd scripts/genetic_algo
$ python -m scoop main.py BTC-CUR 3
```

Important: before usage, create directory
scripts/genetic_algo/logs/hof
