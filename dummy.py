#          7  3
def minmax(a, b):
    # 7  <  3
    if a < b:
        return a, b
    return b, a
 
lo, hi = minmax(7, 3)
print(f"{lo}, {hi}")

