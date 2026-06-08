print ("ingrese la figura geometrica:")
print ("1. circulo")
print ("2. cuadrado")
print ("3. triangulo")
print ("4. rectangulo")
f = int (input ())
if f == 1:
    def c ():
        global a
        r = float (input ("Ingresa el radio "))
        a = (r*r)*3.1416
        a = "%.2f" % a 
        print ("Area circulo",a,"cm")
        return
    c()
if f ==2:
    def c():
        l = float (input ("Ingresa el lado"))
        a =l*l
        a = "%.2f" % a 
        print ("Area cuadrado",a,"cm")
        return 
    c()
if f ==3:
    def c():
        b = float (input ("Ingresa la base"))
        h = float (input ("Ingrese la altura"))
        a =(b*h)/2
        a = "%.2f" % a 
        print ("Area triangulo",a,"cm")
        return 
    c()
if f == 4:
    print ("rectangulo")
    def c():
        l = float (input ("Ingresa la longitud del rectangulo"))
        an = float (input ("Ingrese la ancho"))
        a = l * an
        a = "%.2f" % a 
        print ("Area rectangulo",a,"cm")
        return 
    c()    