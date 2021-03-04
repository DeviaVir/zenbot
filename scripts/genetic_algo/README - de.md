## Genetischer Algorithmus von @arpheno

Zum Kontext:
- # 298 https://github.com/carlos8f/zenbot/issues/298
- das Original PR: https://github.com/carlos8f/zenbot/pull/299
- zusammengeführte PR https://github.com/carlos8f/zenbot/pull/598 
- Bitte beachten Sie, dass der Code verfallen ist und Sie möglicherweise auf seltsame Dinge stoßen

Auf Ihrem Gastgeber:
`` `
$ docker-compose up
$ docker-compose exec server bash
```

Auf Docker-Host (oder ohne Docker):
```
$ fab backfill_local:<days>
$ cd scripts/genetic_algo
$ python -m scoop main.py <product> <days> <individuals> <strategy>
```

Beispiel:
```
$ fab backfill_local:5
$ cd scripts/genetic_algo
$ python -m scoop main.py BTC-CUR 3
```

Wichtig: Erstellen Sie vor der Verwendung ein Verzeichnis
scripts/genetic_algo/logs/hof
