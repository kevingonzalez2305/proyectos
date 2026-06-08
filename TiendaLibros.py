print ("Bienvenidos a la biblioteca.")
bucle = 0
lista = []
listaP = []

while bucle == 0:
    print ("Menu principal:")
    print("1. Gestionar Libros")
    print("2. Préstamos")
    print("3. Salir ")
    salir = 0 
    respuestaMenu = int (input("Seleccione una respuesta:"))
    if respuestaMenu  == 1:
        while salir != 4:
            print ("Gestionar libros:")
            print ("1. Añadir un Libro")
            print ("2. Eliminar un Libro")
            print ("3. Mostrar Todos los Libros")
            print ("4. Regresar al Menú Principal")
            respuestaGestion = int (input ("Seleccione una opcion:"))
            if respuestaGestion == 1: 
                seguirLibro = 1
                while seguirLibro == 1:
                    print ("Añadir un libro:")
                    libro = input("Ingrese el libro que va añadir:")
                    libro = libro.title()
                    lista.append(libro)
                    seguirLibro = int (input ("Ingresar otro libro? 1.si  2. no: "))
            if respuestaGestion == 2:
                print ("Eliminar un libro:")
                seguirLibro=1
                while seguirLibro == 1: 
                    libro = input ("ingrese el libro que quiera eliminar:")
                    libro = libro.title()
                    if libro in lista:
                        lista.remove(libro)
                        print (f"Libro '{libro}' eliminado")
                    else: 
                        print ("Libro no encontrado...")
                    seguirLibro = int (input ("Quieres eliminar otro libro: 1.si  2.no: "))
            if respuestaGestion == 3:
                z = len(lista)
                if z == 0:
                    print ("No hay nigun libro prestado...")
                else: 
                    print ("Mostrar todos los libros:")
                    x=0
                    while x < len(lista):
                       
                        if len(lista) == x + 1:
                            print (lista[x], end = " ")
                        else : 
                             print (lista[x], end = ",")
                        x=x+1
                    print("")
            if respuestaGestion == 4:
                salir = 4
    if respuestaMenu == 2:
        while salir != 4:
            print ("Prestamos: ")
            print ("1. Prestar un Libro")
            print ("2. Devolver un Libro")
            print ("3. Mostrar Libros Prestados")
            print ("4. regresar al Menú Principal")
            respuestaPrestamos = int (input ("Seleccione una respuesta: "))
            if respuestaPrestamos == 1:
                print ("Prestar un libro")
                salir =1
                while salir == 1:
                    libroPrestado = input ("Ingrese el libro que quieres prestar: ")
                    libroPrestado = libroPrestado.title()
                    if libroPrestado in lista: 
                        print (f"libro:'{libroPrestado}' prestado")
                        listaP.append(libroPrestado)
                        lista.remove(libroPrestado) 
                    else: 
                        print ("Libro no encontrado...")
                    salir = int (input ("Quieres prestar otro libro? 1. si 2.no "))
            if respuestaPrestamos == 2:
                print("Devolver un libro")
                salir = 1
                while salir == 1:
                    libroPrestado = input("Ingrese el libro que quieres devolver: ")
                    libroPrestado = libroPrestado.title()  # Asegura el mismo formato
                    if libroPrestado in listaP: 
                        print(f"Libro: '{libroPrestado}' devuelto")
                        listaP.remove(libroPrestado)
                        lista.append(libroPrestado) 
                    else: 
                        print("Libro no encontrado...")
                    salir = int(input("Quieres devolver otro libro: 1.si   2.no"))
            if respuestaPrestamos == 3:
                z = len(listaP)
                if z == 0:
                    print ("No hay ningun libro prestado...")
                else: 
                    print ("Mostrar todos los libros:")
                    x=0
                    while x < len(listaP):
                       
                        if len(listaP) == x + 1:
                            print (listaP[x], end = " ")
                        else : 
                             print (listaP[x], end = ",")
                        x=x+1
                    print("")
            if respuestaPrestamos == 4:
                salir = 4
    if respuestaMenu == 3:
        bucle = 1

            

                

