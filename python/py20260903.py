a=1
b=2

if a>b:
    print("a>b")
elif a<b:
    print("a<b")
else:
    print("a==b")


a={1,2}
if type(1)==type(a):
    print("int")
elif type("")==type(a):
    print("str")
elif type(2.1)==type(a):
    print("float")
elif type(True)==type(a):
    print("bool")
else:
    print("어려운 자료형")

x=2
y=2
while x<=9:
    #print(f"{x}*{y}={x*y}")
    x=x+1
x=2
y=3
while x<=9:
    #print(f"{x}*{y}={x*y}")
    x=x+1


for i in range(0,3): # 0 ~ 3 전까지
    #print(f"i:{i}")
    pass

a=[1,2,3,4,5]
for i in a:
    #print(f"i:{i}")
    pass

a=["dog","cat","turtle"]
for i in a:
    #print(f"i:{i}")
    pass

a="abcde"
print(f"a 야 뭐 가졌니? {a}")
for i in a:
    #print(i)
    pass

for x in range(2,10): # 2~9
    for y in range(1,10): # 1~9
        #print(f"{x}*{y}={x*y} \t",end="")
        pass
    #print("")
    pass

x=[2,3,4,5,6,7,8,9]
y=[1,2,3,4,5,6,7,8,9]
for a in x:
    for b in y:
        print(f"{a}*{b}={a*b} \t",end="")
    print("")



