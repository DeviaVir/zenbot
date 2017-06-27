from operator import attrgetter

from conf import runid, path


class ObjectiveFunctionHallOfFame(object):
    def __init__(self, maxsize=30):
        self.inner = set()
        self.maxsize = maxsize

    def update(self, newpop):
        self.inner = self.inner.union(newpop)
        self.inner = set(sorted(self.inner, key=attrgetter('objective'), reverse=True)[:self.maxsize])

    def __iter__(self):
        return iter(self.inner)

    def len(self):
        return len(self.inner)

    def __repr__(self):
        header = ["Current Hall of Fame:"]
        report = [f"{ind}" for ind in sorted(self.inner, key=attrgetter('objective'), reverse=True)]
        return "\n\n".join(header + report)

    def persist(self):
        with open('{path}/zen/logs/hof/{runid}.txt'.format(path=path, runid=runid), 'w') as f:
            f.write(str(self))
