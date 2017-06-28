import time
from threading import Event, Thread
from blessings import Terminal

term = Terminal()

class ThreadTimer:

    def __init__(self, interval, function):
        self.interval = interval
        self.function = function
        self.start = time.time()
        self.event = Event()
        self.thread = Thread(target=self._target)
        self.thread.start()

    def _target(self):
        while not self.event.wait(self._time):
            with term.location(x=term.width-14):
                print(term.green("Backfilling..."), end='')
            self.function()

    @property
    def _time(self):
        return self.interval - ((time.time() - self.start) % self.interval)
