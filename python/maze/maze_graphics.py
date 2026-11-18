"""Tkinter 미로 화면에서 공통으로 사용하는 쥐 그림."""


def draw_mouse(canvas, x, y, size, ink="#202c34"):
    canvas.create_line(x + .13 * size, y + .65 * size, x + .31 * size, y + .71 * size,
                       fill="#b05d75", width=max(1, size // 20), tags="mouse")
    canvas.create_oval(x + .27 * size, y + .39 * size, x + .76 * size, y + .79 * size,
                       fill="#a9b2bd", outline=ink, tags="mouse")
    canvas.create_oval(x + .56 * size, y + .26 * size, x + .76 * size, y + .50 * size,
                       fill="#e6a6b8", outline=ink, tags="mouse")
    canvas.create_oval(x + .63 * size, y + .44 * size, x + .88 * size, y + .68 * size,
                       fill="#a9b2bd", outline=ink, tags="mouse")
    canvas.create_oval(x + .75 * size, y + .49 * size, x + .80 * size, y + .54 * size,
                       fill=ink, outline="", tags="mouse")
