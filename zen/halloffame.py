from conf import runid
from objective_function import obj


class ObjectiveFunctionHallOfFame(object):
    def __init__(self, maxsize=30):
        self.inner = []
        self.maxsize = maxsize

    def update(self, newpop):
        self.inner = self.inner + [ind for ind in newpop if not any(ind == oldind for oldind in self.inner)]
        self.inner = sorted(self.inner, key=obj, reverse=True)[:self.maxsize]

    def __iter__(self):
        return iter(self.inner)

    def len(self):
        return len(self.inner)

    def __repr__(self):
        header = ["Current Hall of Fame:"]
        report = ["%s %s %s " % (ind.cmdline, ind.fitness.values, obj(ind)) for ind in self.inner]
        return "\n".join(header + report)

    def persist(self):
        with open('logs/hof/{runid}.txt'.format(runid=runid), 'w') as f:
            f.write(str(self))
