"""크기와 지름길 수를 선택할 수 있는 미로 생성기."""

from random import Random

SHORTCUT_RATES = {"쉬움": 0.50, "보통": 0.18, "어려움": 0.0}


def generate_maze(rows: int, cols: int, difficulty: str, seed: int) -> tuple[str, ...]:
    """같은 크기와 seed를 사용하면 복잡도가 낮은 미로에 통로만 더 추가된다."""
    if rows < 5 or cols < 5 or rows % 2 == 0 or cols % 2 == 0:
        raise ValueError("행과 열은 각각 5 이상의 홀수여야 합니다.")

    rng = Random(seed)
    grid = [["#"] * cols for _ in range(rows)]
    grid[1][1] = "."
    stack = [(1, 1)]

    # 두 칸 간격의 방을 방문하고, 처음 방문하는 방 사이의 벽을 허문다.
    # 모든 방이 연결된 뒤에는 두 방 사이의 경로가 하나씩 있다.
    while stack:
        row, col = stack[-1]
        neighbors = []
        for dr, dc in ((-2, 0), (2, 0), (0, -2), (0, 2)):
            nr, nc = row + dr, col + dc
            if 0 < nr < rows - 1 and 0 < nc < cols - 1 and grid[nr][nc] == "#":
                neighbors.append((nr, nc))
        if neighbors:
            nr, nc = rng.choice(neighbors)
            grid[(row + nr) // 2][(col + nc) // 2] = "."
            grid[nr][nc] = "."
            stack.append((nr, nc))
        else:
            stack.pop()

    # 가로 또는 세로로 이웃한 두 방 사이의 남은 벽 중 일부를 지름길로 연다.
    walls = [
        (row, col)
        for row in range(1, rows - 1)
        for col in range(1, cols - 1)
        if (row + col) % 2 == 1 and grid[row][col] == "#"
    ]
    rng.shuffle(walls)
    shortcuts = round(len(walls) * SHORTCUT_RATES[difficulty])
    for row, col in walls[:shortcuts]:
        grid[row][col] = "."

    grid[1][1] = "S"
    grid[rows - 2][cols - 2] = "C"
    return tuple("".join(row) for row in grid)


def generate_escape_maze(
    rows: int, cols: int, difficulty: str, seed: int,
    previous_exit: tuple[int, int] | None = None,
) -> tuple[tuple[str, ...], tuple[int, int]]:
    """연결된 내부 통로에 붙은 외벽 칸 하나를 출구로 연다."""
    grid = [list(row) for row in generate_maze(rows, cols, difficulty, seed)]
    grid[-2][-2] = "."

    # 홀수 좌표의 내부 방은 항상 연결되어 있으므로 그 옆의 외벽을 후보로 쓴다.
    candidates = [(r, c) for r in range(1, rows - 1, 2) for c in (0, cols - 1)]
    candidates += [(r, c) for c in range(1, cols - 1, 2) for r in (0, rows - 1)]
    far_exits = [
        (r, c) for r, c in candidates
        if abs(r - 1) + abs(c - 1) >= (rows + cols) // 3 and (r, c) != previous_exit
    ]
    row, col = Random(seed).choice(far_exits)
    grid[row][col] = "E"
    return tuple("".join(line) for line in grid), (row, col)
