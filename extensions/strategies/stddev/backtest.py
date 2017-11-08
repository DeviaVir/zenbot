from subprocess import call
x = 10
y = 10
while (x < 1000):
    y = x
    while (y < 1000):
        command = 'sudo ./zenbot.sh sim --strategy=stddev --trendtrades_1=' + x + ' --trendtrades_2=' + y + ' --min_periods=1250 --period=100ms --days=3'
        call(command, shell=true)
        print(x)
        print(y)
        y + 10
    x + 10
