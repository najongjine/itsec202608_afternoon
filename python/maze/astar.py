"""상하좌우로 한 칸씩 움직이는 미로의 A* 탐색."""

from dataclasses import dataclass
from heapq import heappop, heappush
from typing import Iterator, Sequence

Position = tuple[int, int]  # (행, 열), 0부터 시작


@dataclass
class SearchStep:
    current: Position
    g: int
    h: int
    frontier: dict[Position, int]  # 다음에 살펴볼 후보와 각각의 g 값
    visited: frozenset[Position]   # 이미 선택해서 살펴본 칸
    path: tuple[Position, ...] = ()  # 목표에 도착한 단계에서만 채워짐

    @property
    def f(self) -> int:
        return self.g + self.h


def manhattan(a: Position, b: Position) -> int:
    """벽을 무시했을 때 상하좌우로 이동해야 하는 최소 횟수."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def reconstruct_path(
    parent: dict[Position, Position], goal: Position
) -> tuple[Position, ...]:
    path = [goal]
    while path[-1] in parent:
        path.append(parent[path[-1]])
    return tuple(reversed(path))


def astar(
    maze: Sequence[str], start: Position, goal: Position
) -> Iterator[SearchStep]:
    """후보를 하나 선택할 때마다 탐색 상태를 제공한다.

    '#'은 벽이고, 그 밖의 칸은 이동할 수 있다. 길이 없으면 탐색이 끝날
    때까지 path가 비어 있다.
    """
    if not maze or not maze[0] or any(len(row) != len(maze[0]) for row in maze):
        raise ValueError("미로는 비어 있지 않은 직사각형이어야 합니다.")

    rows, cols = len(maze), len(maze[0])
    for row, col in (start, goal):
        if not (0 <= row < rows and 0 <= col < cols) or maze[row][col] == "#":
            raise ValueError("출발점과 목표는 미로 안의 통로에 있어야 합니다.")

    # 힙은 f가 가장 작은 후보를 꺼낸다. 동점이면 h, 행, 열 순서로 비교한다.
    start_h = manhattan(start, goal)
    queue = [(start_h, start_h, start)]
    best_g = {start: 0}
    parent: dict[Position, Position] = {}
    visited: set[Position] = set()

    while queue:
        f, h, current = heappop(queue)
        g = f - h
        # 더 짧은 경로가 힙에 추가되면 예전 점수도 남아 있으므로 건너뛴다.
        if g != best_g[current] or current in visited:
            continue

        # 이 미로에서는 한 칸 이동할 때 h가 최대 1만큼 줄어든다.
        # 따라서 큐에서 선택한 칸의 g는 최단 거리다.
        visited.add(current)
        path = ()
        if current == goal:
            path = reconstruct_path(parent, goal)
        else:
            row, col = current
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = row + dr, col + dc
                if not (0 <= nr < rows and 0 <= nc < cols) or maze[nr][nc] == "#":
                    continue

                neighbor = (nr, nc)
                next_g = g + 1
                if neighbor in best_g and next_g >= best_g[neighbor]:
                    continue

                # 더 짧게 갈 수 있으면 거리와 이전 칸을 함께 갱신한다.
                best_g[neighbor] = next_g
                parent[neighbor] = current
                next_h = manhattan(neighbor, goal)
                heappush(queue, (next_g + next_h, next_h, neighbor))

        frontier = {pos: cost for pos, cost in best_g.items() if pos not in visited}
        yield SearchStep(current, g, h, frontier, frozenset(visited), path)
        if path:
            return
