# Entrada del texto
texto = input("Ingresa el texto a modificar: ")

# Reemplazos
texto = texto.replace('b', 'v')  # Cambiar 'b' por 'v'
texto = texto.replace('z', 's')  # Cambiar 'z' por 's'
texto = texto.replace('ll', 'y')  # Cambiar 'll' por 'y'


vocales_minusculas = "aeiou"
vocales_mayusculas = "AEIOU"

for i in range(len(vocales_minusculas)):
    texto = texto.replace(vocales_minusculas[i], vocales_mayusculas[i])

# Salida del texto modificado
print("Texto modificado:", texto)