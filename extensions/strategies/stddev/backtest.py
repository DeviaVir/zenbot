from subprocess import call
x = 5
y = 5

while (x < 1000):
    while (y < 1000):
        A = str(x)
        B =  y * 3
        D = B * 0.3333333333333333333333333333333333333333
        E = D - B
        F = B + D
        G = round(E)
        H = round(F)
        while (G < H)
             I = str(G)
             command = 'sudo ./zenbot.sh sim --strategy=stddev --trendtrades_1=' + A + ' --trendtrades_2=' + I + ' --min_periods=1250 --period=100ms --days=3'
        print(command) 
        call(command, shell=True)
        G = G + 1
        y = y + 5
    x = x + 1
    y = x
