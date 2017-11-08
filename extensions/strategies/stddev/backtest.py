from subprocess import call
x = 10
y = 10

while (y < 1000):
    while (x < 1000):
        A = str(x)
        B = str(y)
        command = 'sudo ./zenbot.sh sim --strategy=stddev --trendtrades_1=' + A + ' --trendtrades_2=' + B + ' --min_periods=1250 --period=100ms --days$
        print(command)
        call(command, shell=True)
        x = x + 10
    y = y + 10
    y = x
