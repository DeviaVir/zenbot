from fabric.api import run,cd

def sim(instrument,days,popsize,strategy):
    with cd('zenbot'):
        cmd = "cd zen && python -m scoop main.py {instrument} {days} {popsize} {strategy}".format(instrument=instrument,days=days,popsize=popsize,strategy=strategy)
        total ='nohup docker-compose exec server bash -c"{cmd}" &'.format(cmd=cmd)
        print(total)#run(total)


