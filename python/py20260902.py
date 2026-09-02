a=1
b=2

if a<b:
    c=1
    if a>0 :
        a=-1
    else :
        a+=3
else:
    b=-3
#print(f"a:{a},b:{b}")

a=1
while a:
    #print(f"while문 반복해요")
    a+=1
    if a>=10:
        break

"""
continue : 반복문 코드 영역에서
밑에있는거 실행하지 마
"""
a=3
while a:
    if a<3:
        a-=1
        continue
    print(f"반복해요{a}")
    a-=1
print(f"끝")


i=1
while i<=5:
    if i==3:
        i=i+1
        continue
    print(f"i:{i}")
    i=i+1
