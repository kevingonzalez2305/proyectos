# Una funcion  binario 

def c():
    l = []
    a = int (input("ingrese un numero"))
    while (a >= 1):
        if a %2==0:
            b = 0
            l.append(b)
            a = a//2
        else: 
            b = 1
            l.append(b)
            a = a//2 
 
    l.reverse()
    print (l)
    return

c()
        