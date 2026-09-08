"""
java, python
숫자, bool, 문자열 얘네만 자료 결합도 (원본에 손상이 안간다)
나머지는 다 stamp 결합도(원본에 손상이 간다)
"""

# 자료결합도
def swap(a,b):
    a,b=b,a
    print(f"a:{a},b:{b}")

a="hi"
b="bye"
swap(a,b)
print(f"a:{a},b:{b}")

# stamp 결합도
a=[1,2]
def swap2(a):
    a[0],a[1]=a[1],a[0]
swap2(a)
#print(a)



class MyA:
    s=0
    def __init__(self): # 생성자
        self.a=1
        self.b=2
    def myf1(self):
        print(f"a:{a},b:{b}")

def swap3(a):
    a.a,a.b=a.b,a.a
a=MyA()
swap3(a)
print(f"{a.a},{a.b}")
