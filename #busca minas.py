#busca minas
import random
import os

ROWS = 9
COLS = 9
MINES = 10

class Cell:
    def __init__(self):
        self.mine = False
        self.revealed = False
        self.flagged = False
        self.neighbor_mines = 0

class Minesweeper:
    def __init__(self, rows, cols, mines):
        self.rows = rows
        self.cols = cols
        self.total_mines = mines
        self.board = [[Cell() for _ in range(cols)] for _ in range(rows)]
        self.first_move = True
        self.game_over = False
        self.revealed_count = 0
        self.place_mines()

    def place_mines(self):
        pass

    def actually_place_mines(self, exclude_row, exclude_col):
        positions = [(r, c) for r in range(self.rows) for c in range(self.cols)
                     if not (r == exclude_row and c == exclude_col)]
        mine_positions = random.sample(positions, self.total_mines)
        for r, c in mine_positions:
            self.board[r][c].mine = True
        for r in range(self.rows):
            for c in range(self.cols):
                if not self.board[r][c].mine:
                    self.board[r][c].neighbor_mines = self.count_neighbor_mines(r, c)

    def count_neighbor_mines(self, row, col):
        count = 0
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                nr, nc = row + dr, col + dc
                if 0 <= nr < self.rows and 0 <= nc < self.cols:
                    if self.board[nr][nc].mine:
                        count += 1
        return count

    def reveal(self, row, col):
        if self.board[row][col].flagged or self.board[row][col].revealed:
            return
        if self.first_move:
            self.actually_place_mines(row, col)
            self.first_move = False
        self.board[row][col].revealed = True
        self.revealed_count += 1
        if self.board[row][col].mine:
            self.game_over = True
            return
        if self.board[row][col].neighbor_mines == 0:
            for dr in [-1, 0, 1]:
                for dc in [-1, 0, 1]:
                    nr, nc = row + dr, col + dc
                    if 0 <= nr < self.rows and 0 <= nc < self.cols:
                        if not self.board[nr][nc].revealed:
                            self.reveal(nr, nc)

    def toggle_flag(self, row, col):
        if not self.board[row][col].revealed:
            self.board[row][col].flagged = not self.board[row][col].flagged

    def print_board(self, reveal_all=False):
        os.system("cls" if os.name == "nt" else "clear")
        print("   " + " ".join([str(i) for i in range(self.cols)]))
        for r in range(self.rows):
            row_str = f"{r:2} "
            for c in range(self.cols):
                cell = self.board[r][c]
                if reveal_all:
                    if cell.mine:
                        row_str += "💣 "
                    elif cell.neighbor_mines > 0:
                        row_str += f"{cell.neighbor_mines} "
                    else:
                        row_str += ". "
                else:
                    if cell.revealed:
                        if cell.mine:
                            row_str += "💣 "
                        elif cell.neighbor_mines > 0:
                            row_str += f"{cell.neighbor_mines} "
                        else:
                            row_str += ". "
                    elif cell.flagged:
                        row_str += "🚩"
                    else:
                        row_str += "# "
            print(row_str)
        print()

    def check_win(self):
        return self.revealed_count == self.rows * self.cols - self.total_mines

def main():
    game = Minesweeper(ROWS, COLS, MINES)
    while not game.game_over:
        game.print_board()
        if game.check_win():
            print("🎉 ¡Felicidades, ganaste!")
            break
        try:
            command = input("Ingresa comando (r fila col = revelar, f fila col = bandera): ").strip().lower()
            if not command:
                continue
            parts = command.split()
            if len(parts) != 3:
                print("❌ Comando inválido.")
                continue
            action, r, c = parts
            r, c = int(r), int(c)
            if not (0 <= r < ROWS and 0 <= c < COLS):
                print("❌ Coordenadas fuera de rango.")
                continue
            if action == "r":
                game.reveal(r, c)
            elif action == "f":
                game.toggle_flag(r, c)
            else:
                print("❌ Acción desconocida.")
        except ValueError:
            print("❌ Error en el formato del comando.")
            continue
    game.print_board(reveal_all=True)
    if game.game_over:
        print("💥 Perdiste. ¡Suerte para la próxima!")

if __name__ == "__main__":
    main()
