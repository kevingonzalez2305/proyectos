import tkinter as tk
from tkinter import ttk, messagebox
import random

class MathApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Aplicación de Operaciones Matemáticas")
        self.root.geometry("800x600")
        self.root.configure(bg="#1e1e1e")

        self.style = ttk.Style()
        self.current_theme = "dark"
        self.configure_theme()

        self.player_name = None
        self.score = 0
        self.level = None

        self.create_welcome_screen()

    def configure_theme(self):
        if self.current_theme == "dark":
            bg = "#1e1e1e"
            fg = "white"
            accent = "#00aaff"
        else:
            bg = "white"
            fg = "black"
            accent = "#0077cc"

        self.root.configure(bg=bg)
        self.style.configure("TLabel", background=bg, foreground=fg, font=("Arial", 14))
        self.style.configure("TButton", font=("Arial", 13), padding=6)
        self.style.map("TButton", background=[("active", accent)])

    def toggle_theme(self):
        self.current_theme = "light" if self.current_theme == "dark" else "dark"
        self.configure_theme()
        self.show_main_menu()

    def clear(self):
        for widget in self.root.winfo_children():
            widget.destroy()

    def create_welcome_screen(self):
        self.clear()
        title = ttk.Label(self.root, text="Bienvenido a la App de Operaciones", font=("Arial", 24, "bold"))
        title.pack(pady=30)

        ttk.Label(self.root, text="Escribe tu nombre:").pack(pady=10)
        self.name_entry = ttk.Entry(self.root, width=30)
        self.name_entry.pack(pady=10)

        ttk.Button(self.root, text="Comenzar", command=self.save_name).pack(pady=20)

    def save_name(self):
        name = self.name_entry.get().strip()
        if name == "":
            messagebox.showerror("Error", "Por favor ingresa un nombre válido.")
            return
        self.player_name = name
        self.show_main_menu()

    def show_main_menu(self):
        self.clear()

        ttk.Label(self.root, text=f"Hola {self.player_name}!", font=("Arial", 20, "bold")).pack(pady=20)
        ttk.Label(self.root, text="Selecciona tu nivel de aprendizaje:").pack(pady=10)

        levels = [
            ("Primaria Básico", "Sumas, restas y multiplicaciones simples."),
            ("Primaria Avanzado", "Operaciones combinadas y problemas básicos."),
            ("Secundaria Básico", "Fracciones, decimales y potencias."),
            ("Secundaria Avanzado", "Ecuaciones, signos y operaciones mixtas.")
        ]

        for name, desc in levels:
            frame = ttk.Frame(self.root)
            frame.pack(pady=10)
            ttk.Button(frame, text=name, command=lambda n=name: self.start_level(n)).pack(side=tk.LEFT, padx=10)
            ttk.Label(frame, text=desc).pack(side=tk.LEFT)

        ttk.Button(self.root, text="Opcional: Operaciones especiales", command=self.optional_menu).pack(pady=20)

        ttk.Button(self.root, text="Cambiar Tema", command=self.toggle_theme).pack(pady=10)

    def optional_menu(self):
        self.clear()
        ttk.Label(self.root, text="Opciones especiales de práctica", font=("Arial", 20, "bold")).pack(pady=20)

        options = [
            ("Fracciones", "Suma/resta de fracciones"),
            ("Decimales", "Operaciones con números decimales"),
            ("Mixto", "Operaciones variadas de nivel avanzado")
        ]

        for name, desc in options:
            frame = ttk.Frame(self.root)
            frame.pack(pady=10)
            ttk.Button(frame, text=name, command=lambda n=name: self.start_optional(n)).pack(side=tk.LEFT, padx=10)
            ttk.Label(frame, text=desc).pack(side=tk.LEFT)

        ttk.Button(self.root, text="Volver", command=self.show_main_menu).pack(pady=20)

    def start_level(self, level):
        self.level = level
        self.score = 0
        self.generate_question()

    def start_optional(self, option):
        self.level = option
        self.score = 0
        self.generate_question()

    def generate_question(self):
        self.clear()

        ttk.Label(self.root, text=f"Nivel: {self.level}", font=("Arial", 18, "bold")).pack(pady=10)
        ttk.Label(self.root, text=f"Puntuación: {self.score}").pack(pady=5)

        if self.level == "Primaria Básico":
            a, b = random.randint(1,10), random.randint(1,10)
            op = random.choice(["+","-","*"])
            self.correct = eval(f"{a}{op}{b}")
            problem = f"{a} {op} {b}" 

        elif self.level == "Primaria Avanzado":
            a, b, c = random.randint(1,10), random.randint(1,10), random.randint(1,10)
            op1, op2 = random.choice(["+","-","*"]), random.choice(["+","-"])
            self.correct = eval(f"{a}{op1}{b}{op2}{c}")
            problem = f"{a} {op1} {b} {op2} {c}"

        elif self.level == "Fracciones":
            a, b = random.randint(1,9), random.randint(1,9)
            c, d = random.randint(1,9), random.randint(1,9)
            op = random.choice(["+", "-"])
            self.correct = eval(f"({a}/{b}) {op} ({c}/{d})")
            problem = f"{a}/{b} {op} {c}/{d}"

        else:
            a, b = random.randint(1,50), random.randint(1,50)
            op = random.choice(["+","-","*"])
            self.correct = eval(f"{a}{op}{b}")
            problem = f"{a} {op} {b}"

        ttk.Label(self.root, text=f"Resuelve: {problem}", font=("Arial", 18)).pack(pady=20)

        self.answer = ttk.Entry(self.root, width=10)
        self.answer.pack(pady=10)

        ttk.Button(self.root, text="Enviar", command=self.check_answer).pack(pady=10)

    def check_answer(self):
        try:
            user_ans = float(self.answer.get())
            if abs(user_ans - self.correct) < 0.001:
                self.score += 1
                messagebox.showinfo("Correcto", "¡Muy bien!")
            else:
                messagebox.showerror("Incorrecto", f"La respuesta correcta era {self.correct}")
        except:
            messagebox.showerror("Error", "Ingresa un número válido.")

        self.generate_question()

root = tk.Tk()
app = MathApp(root)
root.mainloop()
