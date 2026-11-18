"""쥐가 A*로 치즈를 찾는 과정을 보여 주는 Tkinter 시뮬레이션."""

import tkinter as tk
from random import getrandbits
from tkinter import ttk

from astar import astar, manhattan
from maze import SHORTCUT_RATES, generate_maze
from maze_graphics import draw_mouse


EXAMPLE_MAZE = (
    "###############",
    "#S...#........#",
    "#.#..#.#####..#",
    "#.#..#.....#..#",
    "#.#..#####.#..#",
    "#....#...#.#..#",
    "#.##.#.#.#.#..#",
    "#.#..#.#...#..#",
    "#.#....#####..#",
    "#...#.......#C#",
    "###############",
)

BACKGROUND = "#f5f3ee"
INK = "#202c34"
MUTED = "#53626c"
WALL = "#35454f"
OPEN = "#fdfcf9"
VISITED = "#d4e7e5"
FRONTIER = "#e5dcf7"
CURRENT = "#187b70"
PATH = "#f6dc92"
SIZES = {f"{rows} × {cols}": (rows, cols) for rows, cols in ((11, 15), (15, 21), (19, 27), (23, 33))}
SPEEDS = {"느리게": 650, "보통": 260, "빠르게": 80, "아주 빠르게": 20}


class Simulation:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.timer = None
        self.maze_seed = getrandbits(64)
        self.size = tk.StringVar(value=next(iter(SIZES)))
        self.difficulty = tk.StringVar(value="보통")
        self.speed = tk.StringVar(value="보통")
        self.status = tk.StringVar()
        self.position = tk.StringVar()
        self.scores = tk.StringVar()
        self.counts = tk.StringVar()

        root.title("A* 미로 탐색 | 쥐와 치즈")
        root.geometry("960x680")
        root.minsize(810, 580)
        root.configure(bg=BACKGROUND)
        root.option_add("*Font", ("맑은 고딕", 10))
        style = ttk.Style(root)
        style.theme_use("clam")
        style.configure("TButton", padding=(10, 5))
        style.configure("Play.TButton", background=CURRENT, foreground="white")
        style.map("Play.TButton", background=[("active", "#12665d")])

        header = tk.Frame(root, bg=BACKGROUND)
        header.pack(fill="x", padx=24, pady=(16, 12))
        self.label(header, "쥐와 치즈", size=24, bold=True).pack(anchor="w")
        self.label(header, "A*가 어떤 칸을 먼저 선택하는지 따라가 보세요.", color=MUTED).pack(anchor="w")

        settings = tk.Frame(root, bg=BACKGROUND)
        settings.pack(fill="x", padx=24, pady=(0, 8))
        self.label(settings, "크기 (행×열)").pack(side="left", padx=(0, 6))
        size_picker = ttk.Combobox(settings, values=tuple(SIZES), textvariable=self.size, state="readonly", width=9)
        size_picker.pack(side="left")
        size_picker.bind("<<ComboboxSelected>>", self.apply_maze_settings)
        self.label(settings, "복잡도").pack(side="left", padx=(16, 6))
        difficulty_picker = ttk.Combobox(settings, values=tuple(SHORTCUT_RATES), textvariable=self.difficulty,
                                         state="readonly", width=7)
        difficulty_picker.pack(side="left")
        difficulty_picker.bind("<<ComboboxSelected>>", self.apply_maze_settings)
        ttk.Button(settings, text="새 미로", command=self.new_maze).pack(side="left", padx=12)

        controls = tk.Frame(root, bg=BACKGROUND)
        controls.pack(side="bottom", fill="x", padx=24, pady=(8, 16))
        self.play_button = ttk.Button(controls, command=self.toggle_play, style="Play.TButton")
        self.play_button.pack(side="left")
        self.step_button = ttk.Button(controls, text="한 단계", command=self.advance)
        self.step_button.pack(side="left", padx=8)
        ttk.Button(controls, text="처음으로", command=self.reset).pack(side="left")
        ttk.Combobox(controls, values=tuple(SPEEDS), textvariable=self.speed, state="readonly", width=11).pack(side="right")
        self.label(controls, "재생 속도", color=MUTED).pack(side="right", padx=8)

        content = tk.Frame(root, bg=BACKGROUND)
        content.pack(fill="both", expand=True, padx=24)
        panel = tk.Frame(content, bg=BACKGROUND, padx=18)
        panel.pack(side="right", fill="y")
        self.canvas = tk.Canvas(content, bg=BACKGROUND, highlightthickness=0)
        self.canvas.pack(side="left", fill="both", expand=True)

        self.label(panel, "현재 선택한 칸", size=14, bold=True).pack(anchor="w")
        self.label(panel, textvariable=self.position, color=MUTED).pack(anchor="w", pady=(4, 0))
        self.label(panel, textvariable=self.scores, size=15, bold=True).pack(anchor="w", pady=(0, 7))
        for description in (
            "g   출발점부터 이동한 횟수",
            "h   벽을 무시한 치즈까지의 거리",
            "f    g + h, 다음 칸을 고르는 기준",
        ):
            self.label(panel, description, color=MUTED).pack(anchor="w")
        self.label(panel, textvariable=self.counts).pack(anchor="w", pady=(12, 0))
        self.label(panel, textvariable=self.status, color=CURRENT, bold=True, wraplength=230).pack(anchor="w", pady=(4, 12))

        for color, description in (
            (CURRENT, "현재 선택한 칸"),
            (VISITED, "이미 살펴본 칸"),
            (FRONTIER, "다음 후보 (숫자는 f 값)"),
            (PATH, "최단 경로"),
        ):
            row = tk.Frame(panel, bg=BACKGROUND)
            row.pack(fill="x", pady=2)
            tk.Frame(row, bg=color, width=14, height=14).pack(side="left")
            self.label(row, description).pack(side="left", padx=8)

        self.set_maze(EXAMPLE_MAZE)
        self.canvas.bind("<Configure>", lambda event: self.draw())

    def label(self, parent, text="", *, size=10, bold=False, color=INK, **options):
        weight = "bold" if bold else "normal"
        return tk.Label(parent, text=text, bg=BACKGROUND, fg=color,
                        font=("맑은 고딕", size, weight), justify="left", **options)

    def apply_maze_settings(self, _event=None):
        rows, cols = SIZES[self.size.get()]
        self.set_maze(generate_maze(rows, cols, self.difficulty.get(), self.maze_seed))

    def new_maze(self):
        self.maze_seed = getrandbits(64)
        self.apply_maze_settings()

    def set_maze(self, maze):
        self.maze = maze
        self.start = next((r, row.index("S")) for r, row in enumerate(maze) if "S" in row)
        self.goal = next((r, row.index("C")) for r, row in enumerate(maze) if "C" in row)
        self.reset()

    def reset(self):
        self.pause()
        self.search = astar(self.maze, self.start, self.goal)
        self.step = None
        self.path_index = 0
        self.mouse = self.start
        self.finished = False
        self.status.set("자동 재생 또는 한 단계로 시작하세요.")
        self.position.set("선택 전")
        self.scores.set("g –   h –   f –")
        self.counts.set("탐색 0칸   ·   후보 0칸")
        self.update_buttons()
        self.draw()

    def advance(self):
        if self.finished:
            return

        if self.step and self.step.path:
            self.path_index += 1
            self.mouse = self.step.path[self.path_index]
            if self.mouse == self.goal:
                self.status.set(f"치즈 도착! 최단 경로 {self.path_index}회 이동")
                self.finished = True
        else:
            step = next(self.search, None)
            if step is None:
                self.status.set("치즈까지 가는 길이 없습니다.")
                self.finished = True
            else:
                self.step = step
                row, col = step.current
                self.position.set(f"{row}행 {col}열")
                self.scores.set(f"g {step.g}   h {step.h}   f {step.f}")
                self.counts.set(f"탐색 {len(step.visited)}칸   ·   후보 {len(step.frontier)}칸")
                if step.path:
                    self.status.set(f"최단 경로 발견! 쥐가 {step.g}회 이동합니다.")
                else:
                    self.status.set("후보에서 f가 작은 칸을 선택합니다.")

        self.draw()
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

    def draw(self):
        canvas = self.canvas
        canvas.delete("all")
        rows, cols = len(self.maze), len(self.maze[0])
        width, height = canvas.winfo_width(), canvas.winfo_height()
        cell = min((width - 24) // cols, (height - 24) // rows)
        if cell < 1:
            return

        left = (width - cols * cell + 16) // 2
        top = (height - rows * cell + 16) // 2
        number_font = ("맑은 고딕", -max(8, min(14, cell // 2)))
        frontier = self.step.frontier if self.step else {}
        visited = self.step.visited if self.step else frozenset()
        path = set(self.step.path) if self.step else set()
        current = self.step.current if self.step and not path else None

        for col in range(cols):
            canvas.create_text(left + (col + 0.5) * cell, top - 9, text=str(col), fill=MUTED, font=number_font)
        for row in range(rows):
            canvas.create_text(left - 10, top + (row + 0.5) * cell, text=str(row), fill=MUTED, font=number_font)
            for col in range(cols):
                position = (row, col)
                x, y = left + col * cell, top + row * cell
                color = WALL if self.maze[row][col] == "#" else OPEN
                if position in visited:
                    color = VISITED
                if position in frontier:
                    color = FRONTIER
                if position == current:
                    color = CURRENT
                if position in path:
                    color = PATH
                canvas.create_rectangle(x, y, x + cell, y + cell, fill=color, outline=BACKGROUND)

                if position in frontier and position != self.goal:
                    f = frontier[position] + manhattan(position, self.goal)
                    canvas.create_text(x + cell / 2, y + cell / 2, text=str(f), fill=INK, font=number_font)
                if position == self.goal and self.mouse != self.goal:
                    self.draw_cheese(x, y, cell)
                if position == self.mouse:
                    draw_mouse(canvas, x, y, cell)

    def draw_cheese(self, x, y, size):
        self.canvas.create_polygon(
            x + .17 * size, y + .49 * size, x + .68 * size, y + .22 * size,
            x + .86 * size, y + .44 * size, x + .86 * size, y + .75 * size,
            x + .17 * size, y + .75 * size, fill="#ffc955", outline="#925b1d",
        )
        for dx, dy in ((.34, .57), (.63, .49)):
            self.canvas.create_oval(x + dx * size, y + dy * size,
                                    x + (dx + .12) * size, y + (dy + .12) * size,
                                    fill="#b96c28", outline="")


if __name__ == "__main__":
    root = tk.Tk()
    Simulation(root)
    root.mainloop()
