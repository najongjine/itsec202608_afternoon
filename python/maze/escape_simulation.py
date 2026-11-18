"""깊이 우선 탐색으로 미로를 빠져나가는 쥐를 보여 주는 Tkinter 앱."""

import tkinter as tk
from random import getrandbits
from tkinter import ttk

from escape_dfs import explore, read_neighborhood
from maze import SHORTCUT_RATES, generate_escape_maze
from maze_graphics import draw_mouse


BACKGROUND = "#101c27"
PANEL = "#192a37"
INK = "#f2f6f8"
MUTED = "#b2c4ce"
UNKNOWN = "#223645"
WALL = "#344a5c"
OPEN = "#f0ece1"
ROUTE = "#f0b659"
BACKTRACKED = "#ad9dc6"
EXIT = "#54dbc3"
SIZES = {f"{rows} × {cols}": (rows, cols) for rows, cols in ((21, 31), (31, 47), (41, 61))}
SPEEDS = {"느리게": 450, "보통": 110, "빠르게": 35, "아주 빠르게": 8}
MESSAGES = {
    "forward": "아직 방문하지 않은 통로로 전진",
    "backtrack": "더 갈 곳이 없어 이전 칸으로 이동",
    "exit": "출구 발견! 미로 탈출 성공",
}


class EscapeSimulation:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.timer = None
        self.seed = getrandbits(64)
        self.previous_exit = None
        self.size = tk.StringVar(value="31 × 47")
        self.difficulty = tk.StringVar(value="어려움")
        self.speed = tk.StringVar(value="빠르게")
        self.show_full_map = tk.BooleanVar(value=False)
        self.status = tk.StringVar()
        self.counts = tk.StringVar()
        self.position = tk.StringVar()

        root.title("쥐의 미로 탈출 | 깊이 우선 탐색")
        root.geometry("1120x750")
        root.minsize(810, 570)
        root.configure(bg=BACKGROUND)
        style = ttk.Style(root)
        style.theme_use("clam")
        style.configure("TButton", padding=(10, 5), font=("맑은 고딕", 10))
        style.configure("Escape.TButton", background=EXIT, foreground=BACKGROUND)
        style.map("Escape.TButton", background=[("active", "#91ecd9")])

        header = tk.Frame(root, bg=BACKGROUND)
        header.pack(fill="x", padx=24, pady=(16, 12))
        self.label(header, "쥐의 미로 탈출", size=24, bold=True).pack(anchor="w")
        self.label(header, "깊이 우선 탐색(DFS)으로 출구를 찾습니다.", color=MUTED).pack(anchor="w")

        settings = tk.Frame(root, bg=BACKGROUND)
        settings.pack(fill="x", padx=24, pady=(0, 10))
        self.picker(settings, "크기 (행×열)", self.size, SIZES, width=9).bind(
            "<<ComboboxSelected>>", self.apply_settings
        )
        self.picker(settings, "복잡도", self.difficulty, SHORTCUT_RATES, width=7).bind(
            "<<ComboboxSelected>>", self.apply_settings
        )
        ttk.Button(settings, text="새 미로", command=self.new_maze).pack(side="left", padx=4)
        tk.Checkbutton(settings, text="전체 미로 보기", variable=self.show_full_map,
                       command=self.draw_board, bg=BACKGROUND, fg=INK, activebackground=BACKGROUND,
                       activeforeground=INK, selectcolor=PANEL, highlightthickness=0,
                       font=("맑은 고딕", 10)).pack(side="left", padx=10)

        controls = tk.Frame(root, bg=BACKGROUND)
        controls.pack(side="bottom", fill="x", padx=24, pady=(12, 16))
        self.play_button = ttk.Button(controls, command=self.toggle_play, style="Escape.TButton")
        self.play_button.pack(side="left")
        self.step_button = ttk.Button(controls, text="한 단계", command=self.advance)
        self.step_button.pack(side="left", padx=8)
        ttk.Button(controls, text="처음으로", command=self.reset).pack(side="left")
        speed_controls = tk.Frame(controls, bg=BACKGROUND)
        speed_controls.pack(side="right")
        self.picker(speed_controls, "재생 속도", self.speed, SPEEDS, width=11)

        content = tk.Frame(root, bg=BACKGROUND)
        content.pack(fill="both", expand=True, padx=24)
        panel = tk.Frame(content, bg=PANEL, padx=16, pady=14)
        panel.pack(side="right", fill="y", padx=(14, 0))
        self.canvas = tk.Canvas(content, bg=BACKGROUND, highlightthickness=0)
        self.canvas.pack(side="left", fill="both", expand=True)

        self.label(panel, "탐색 상태", size=14, bold=True).pack(anchor="w")
        self.label(panel, textvariable=self.status, color=EXIT, bold=True, width=25,
                   height=2, wraplength=190, anchor="w").pack(anchor="w", pady=(3, 6))
        self.label(panel, textvariable=self.position, color=MUTED).pack(anchor="w")
        self.label(panel, textvariable=self.counts).pack(anchor="w", pady=(4, 15))
        for color, text in ((UNKNOWN, "아직 확인하지 않은 구역"), (ROUTE, "현재 스택에 남은 경로"),
                            (BACKTRACKED, "되돌아 나온 통로"), (EXIT, "출구")):
            row = tk.Frame(panel, bg=PANEL)
            row.pack(anchor="w", pady=3)
            tk.Frame(row, bg=color, width=13, height=13).pack(side="left")
            self.label(row, text).pack(side="left", padx=6)

        self.canvas.bind("<Configure>", self.draw_board)
        self.apply_settings()

    def label(self, parent, text="", *, size=10, color=INK, bold=False, **options):
        return tk.Label(parent, text=text, bg=parent.cget("bg"), fg=color,
                        font=("맑은 고딕", size, "bold" if bold else "normal"),
                        justify="left", **options)

    def picker(self, parent, label, variable, values, width):
        self.label(parent, label).pack(side="left", padx=(0, 6))
        combo = ttk.Combobox(parent, textvariable=variable, values=tuple(values),
                             state="readonly", width=width, font=("맑은 고딕", 10))
        combo.pack(side="left", padx=(0, 12))
        return combo

    def apply_settings(self, _event=None):
        rows, cols = SIZES[self.size.get()]
        self.maze, self.exit_position = generate_escape_maze(
            rows, cols, self.difficulty.get(), self.seed, previous_exit=self.previous_exit,
        )
        self.reset()

    def new_maze(self):
        self.previous_exit = self.exit_position
        self.seed = getrandbits(64)
        self.apply_settings()

    def reset(self):
        self.pause()
        self.mouse = (1, 1)
        self.steps = explore(self.mouse, lambda position: read_neighborhood(self.maze, position))
        self.trail = {self.mouse: ROUTE}
        self.revealed = set()
        self.reveal(self.mouse)
        self.moves = 0
        self.retreats = 0
        self.finished = False
        self.status.set("자동 재생 또는 한 단계로 시작")
        self.show_counts(stack_size=1)
        self.update_buttons()
        self.draw_board()

    def show_counts(self, stack_size):
        row, col = self.mouse
        self.position.set(f"쥐 위치   {row}행 {col}열")
        self.counts.set(f"이동 {self.moves}회\n되돌아가기 {self.retreats}회\n스택에 남은 칸 {stack_size}개")

    def advance(self):
        if self.finished:
            return

        step = next(self.steps, None)
        if step is None:
            self.finished = True
            self.status.set("도달할 수 있는 출구가 없습니다.")
            self.show_counts(stack_size=0)
        else:
            previous = self.mouse
            if step.action == "backtrack":
                self.retreats += 1
                self.trail[previous] = BACKTRACKED
            self.mouse = step.position
            self.trail[self.mouse] = ROUTE
            self.moves += 1
            self.finished = step.action == "exit"
            self.status.set(MESSAGES[step.action])
            self.show_counts(step.stack_size)
            self.move_mouse(previous)
        self.update_buttons()

    def toggle_play(self):
        if self.timer is not None:
            self.pause()
            self.update_buttons()
        else:
            self.tick()

    def tick(self):
        self.timer = None
        self.advance()
        if not self.finished:
            self.timer = self.root.after(SPEEDS[self.speed.get()], self.tick)
        self.update_buttons()

    def pause(self):
        if self.timer is not None:
            self.root.after_cancel(self.timer)
            self.timer = None

    def update_buttons(self):
        playing = self.timer is not None
        self.play_button.config(text="일시 정지" if playing else "자동 재생",
                                state="disabled" if self.finished else "normal")
        self.step_button.config(state="disabled" if playing or self.finished else "normal")

    def draw_board(self, _event=None):
        canvas = self.canvas
        canvas.delete("all")
        self.tiles = {}
        rows, cols = len(self.maze), len(self.maze[0])
        width, height = canvas.winfo_width(), canvas.winfo_height()
        self.cell = min(width // cols, height // rows)
        if self.cell < 1:
            return

        left = (width - self.cell * cols) // 2
        top = (height - self.cell * rows) // 2
        for row in range(rows):
            for col in range(cols):
                x, y = left + col * self.cell, top + row * self.cell
                self.tiles[row, col] = canvas.create_rectangle(
                    x, y, x + self.cell, y + self.cell, fill=self.tile_color((row, col)), outline=""
                )
        row, col = self.mouse
        draw_mouse(canvas, left + col * self.cell, top + row * self.cell, self.cell)

    def tile_color(self, position):
        show_full_map = self.show_full_map.get()
        if not show_full_map and position not in self.revealed:
            return UNKNOWN

        row, col = position
        tile = self.maze[row][col]
        if tile == "#":
            return WALL
        if tile == "E" and (show_full_map or position == self.mouse):
            return EXIT
        if position == self.mouse:
            return "#ffda91"
        return self.trail.get(position, OPEN)

    def reveal(self, position):
        view = read_neighborhood(self.maze, position)
        visible = {neighbor for neighbor, _ in view.neighbors}
        visible.add(position)
        self.revealed.update(visible)
        return visible

    def move_mouse(self, previous):
        affected = self.reveal(self.mouse)
        if not self.tiles:
            return
        affected.add(previous)
        for position in affected:
            self.canvas.itemconfigure(self.tiles[position], fill=self.tile_color(position))
        row, col = self.mouse
        last_row, last_col = previous
        self.canvas.move("mouse", (col - last_col) * self.cell, (row - last_row) * self.cell)


if __name__ == "__main__":
    root = tk.Tk()
    EscapeSimulation(root)
    root.mainloop()
