def fib(n) :
    result = [ ]
    x, y = 1, 1
    for _ in range(n):
        result.append(x)
        x, y = y, x+y
    print(result)
    return result
 
count = 7
print(fib(count)[-1])