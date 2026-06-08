from random import randint 
lista = []

bucle = 1
pp = 1

while pp == 1:
    no_dejar_salir = 1 
    while no_dejar_salir == 1:
        
        print("1. Añadir elementos")
        print("2. Eliminar elementos")
        print("3. Mostrar elementos")
        print("4. Caja registradora y recibo")
        print("5. Salir")
        
        x = 0
        i = 1
        bucle = int(input("Ingrese una opción: "))

        #  "Caja registradora"
        if bucle == 4: 
            t = len(lista)
            if t == 0:
                print("NO HAY NINGÚN ARTÍCULO PARA COMPRAR")
                no_dejar_salir = 1
                continue
            else:
                no_dejar_salir = 2
        
        #  "Eliminar elementos"
        elif bucle == 2:
            t = len(lista)
            if t == 0:
                no_dejar_salir = 1
                print("NO HAY NINGÚN ARTÍCULO EN LA LISTA")
            else:
                no_dejar_salir = 2
        else:
            no_dejar_salir = 2
        
    #  Añadir elementos
    if bucle == 1:
        print("Añadir elementos:")
        while i == 1:
            arti = input("Ingrese un artículo: ")
            lista.append(arti)
            i = int(input("Agregar otro artículo (1. Sí 2. No): "))
        x = 0  # Reiniciar índice para mostrar la lista completa
        while x < len(lista):
            print(lista[x], end=", ")
            x += 1
        print("")
        pp = 1  
        
    # Eliminar elementos
    elif bucle == 2:
        print('Eliminar elementos:')
        while i == 1:
            u = input("Ingrese el nombre del producto que desea eliminar: ")
            if u in lista:
                lista.remove(u)
                print(f"Se ha eliminado: {u}")
            else: 
                print("No se encontró el elemento :c")
            i = int(input("¿Eliminar otro artículo? (1. Sí 2. No): "))
        pp = 1  # Reiniciar para volver al menú principal
    
    #  Mostrar elementos
    elif bucle == 3:
        print("Mostrar elementos")
        x = 0
        while x < len(lista):
            print(lista[x], end=", ")
            x += 1
        print("")

    # Caja registradora
    elif bucle == 4:
        print("Caja registradora:")
        total = randint(1, 500) 
        print("Costo total:", total)
        
        decisionP = int(input("Selecciona método de pago: 1. Efectivo o 2. Tarjeta: "))
        
        if decisionP == 1:  # Pago en efectivo
            print("Efectivo seleccionado")
            impuesto = total * 0.16
            total_con_impuesto = total + impuesto
            print(f"Total con impuesto (16%): {total_con_impuesto}")
            
            pagado = 0  
            while pagado < total_con_impuesto:
                monto = float(input("Ingresa tu pago (monto adicional): "))
                pagado += monto  # Se acumula el monto pagado
                restante = total_con_impuesto - pagado
                
                if restante > 0:
                    print(f"Pago insuficiente, te faltan: {restante:.2f} $")
                else:
                    cambio = abs(restante)
                    print(f"Pago exitoso. Tu cambio es: {cambio:.2f} $")
                    print("Recibo:")
                    print("| Articulos comprados:",lista)
                    if decisionP == 1: 
                        print(f"Tu cambio es: {cambio:.2f} $")
                        print("| Monto pagado:",total_con_impuesto)
                        print("| Metodo de pago: Efectivo"  )
                        break
                    elif decisionP == 2:
                        print("| Monto pagado:",total)
                        print("| Metodo de pago: Tarjeta")
                        print( "| Cambio:",cambio )
         

        elif decisionP == 2:  # Pago con tarjeta
            print("Tarjeta seleccionada")
            print("Pago exitoso  ")
            cambio=0
            print("Recibo:")
            print("| Articulos comprados:",lista)
            if decisionP == 1: 
                print("| Monto pagado:",total_con_impuesto)
                print("| Metodo de pago: Efectivo"  )
            elif decisionP == 2:
                print("| Monto pagado:",total)
                print("| Metodo de pago: Tarjeta")
                print( "| Cambio:",cambio )
                break
         
    
         
                
    # Preguntar si desea volver al menú
    pp = int(input("¿Volver al menú? (1. Sí ): "))  
 