from subprocess import call
x = 5 
y = 5 

while (x < 1000):
    while (y < 1000):
        A = str(x)
        B =  y
        D = B * 0.333333333333333333333333333333333333333333333333333333333333333333333333
        E = B - D
        F = B + D
        H = int(round(F))
        L = int(round(E))
        while (H > L):
            I = str(L)
            command = 'sudo ./zenbot.sh sim --strategy=stddev --trendtrades_1=' + A + ' --trendtrades_2=' + I + ' --min_periods=1250 --period=100ms --days=3'
            print(command) 
            call(command, shell=True)
            L = L + 1
    y = (y + 5) * 6
    x = x + 5
    y = x
