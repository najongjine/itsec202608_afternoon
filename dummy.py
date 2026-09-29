# a = 97, b= 98, c=99 ,d = 100, e=101, f=102

def test(a, b):
    #        [  99  ,  102]
    input = [ord(a), ord(b)]
    input.sort()
    # i=99   j=102
    i, j = input
    ans = []
    #             99, 102     99~101
    for k in range(i, j + 1):
        # ans=[c,d,e]
        ans.append(chr(k))

    return ans

for i in ['c','d','e']:
    print(i, end="") # cde