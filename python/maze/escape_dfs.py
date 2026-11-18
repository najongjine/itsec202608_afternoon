"""출구의 좌표를 모르는 쥐가 깊이 우선 탐색으로 미로를 탈출한다."""

from dataclasses import dataclass
from typing import Callable, Iterator, Literal, Sequence

Position = tuple[int, int]  # (행, 열), 0부터 시작


@dataclass(frozen=True)
class EscapeStep:
    position: Position
    action: Literal["forward", "backtrack", "exit"]
    stack_size: int


@dataclass(frozen=True)
class LocalView:
    at_exit: bool
    neighbors: tuple[tuple[Position, bool], ...]  # 이웃 칸 좌표와 통과 가능 여부


def read_neighborhood(maze: Sequence[str], position: Position) -> LocalView:
    """시뮬레이터의 센서. 현재 칸의 출구 여부와 인접 칸의 통과 여부를 돌려준다."""
    rows, cols = len(maze), len(maze[0])
    row, col = position
    neighbors = []
    for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
        nr, nc = row + dr, col + dc
        if 0 <= nr < rows and 0 <= nc < cols:
            neighbors.append(((nr, nc), maze[nr][nc] != "#"))
    return LocalView(maze[row][col] == "E", tuple(neighbors))


def escape_dfs(maze: Sequence[str], start: Position) -> Iterator[EscapeStep]:
    """문자열 미로를 센서에 연결해서 DFS를 실행하는 편의 함수."""
    if not maze or not maze[0] or any(len(row) != len(maze[0]) for row in maze):
        raise ValueError("미로는 비어 있지 않은 직사각형이어야 합니다.")

    rows, cols = len(maze), len(maze[0])
    row, col = start
    if not (0 <= row < rows and 0 <= col < cols) or maze[row][col] == "#":
        raise ValueError("출발점은 미로 안의 통로에 있어야 합니다.")
    yield from explore(start, lambda position: read_neighborhood(maze, position))


def explore(start: Position, sense: Callable[[Position], LocalView]) -> Iterator[EscapeStep]:
    """출발점과 주변을 확인하는 센서로만 탐색한다. 움직일 때마다 한 단계를 전달한다."""
    view = sense(start)
    if view.at_exit:
        yield EscapeStep(start, "exit", 1)
        return

    stack = [start]     # 지금 위치까지 온 경로. 마지막 칸이 현재 위치다.
    visited = {start}  # 되돌아갔더라도 이미 살펴본 칸은 다시 탐색하지 않는다.

    while stack:
        for neighbor, can_enter in view.neighbors:
            if not can_enter or neighbor in visited:
                continue

            # 센서가 보여 준 이웃 중 새 통로 하나로 이동한 뒤 그 자리에서 읽는다.
            visited.add(neighbor)
            stack.append(neighbor)
            view = sense(neighbor)
            if view.at_exit:
                yield EscapeStep(neighbor, "exit", len(stack))
                return
            yield EscapeStep(neighbor, "forward", len(stack))
            break
        else:
            # 더 갈 곳이 없으면 스택에서 현재 칸을 빼고 바로 전 칸으로 돌아간다.
            stack.pop()
            if stack:
                view = sense(stack[-1])
                yield EscapeStep(stack[-1], "backtrack", len(stack))
