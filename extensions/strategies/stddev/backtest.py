from subprocess import call
x = 5
y = x * 9.6
while (x < 1000):
    A = str(x)
    C = y * 0.1 
    L = y - C
    H = y + C
    while (H > L):
        J = round(L)
        K = int(J)
        I = str(K)
        command = 'sudo ./zenbot.sh sim --strategy=stddev --trendtrades_1=' + A + ' --trendtrades_2=' + I + ' --min_periods=1250 --period=100ms --days$
        print(command) 
        call(command, shell=True)
        L = L + 1
    x = x + 1
    y = x * 9.6
