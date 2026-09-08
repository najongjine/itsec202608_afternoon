# 버블정렬
a=[1,9,7,6]

for d in range(len(a)-1):
    for index in range(len(a)-1):
        if a[index] > a[index+1]:
            a[index],a[index+1]=a[index+1],a[index]
#print(f"a:{a}")


# 사용자 정의 함수
"""
함수는 기계에요. 설계도가 있고,
내용물이 있고,
호출이 있어요
"""
def f1(): # 설계도
    print(f"내가만든 함수")

def f2(mydata):
    print(f"{mydata} 를 받았어요")

def f3(a,b,c):
    print(f"{a},{b},{c} 받았어요")

def f4(a,b):
    return a+b

#f1() # 함수를 호출한다
#f2(55453)
#f3(23,3,1)
#n1=f4(2,3)

"""
파이썬은 c,java처럼 {} 가 없어요. 그래서 
scope(영역 개념이 없어요)
단, 함수랑 class에는 영역개념이 있어요.
"""
def f5(a):
    a=a+2
a=1
f5(a)
if a:
    a=3
print(f"a:{a}")

