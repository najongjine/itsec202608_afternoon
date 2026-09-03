a=1
b=2

if a>b:
    print("a>b")
elif a<b:
    print("a<b")
else:
    print("a==b")


a=1.1
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
