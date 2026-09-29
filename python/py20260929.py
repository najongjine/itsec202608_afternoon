a=[1,6,3,23,5]

# 오름차순 정렬   작은거~큰거
a.sort()

# 내림차순  큰거부터~작은거
a.sort(reverse=True)

a=["dog","cat","wormbat","ant"]
"""
원본 a는 안바뀌고, 정렬된 복사본을 a2에 저장한다
"""
a2=sorted(a)
print(f"a:{a}")
print(f"a2:{a2}")

"""
List comprehension
"""
#    3              1           2
a = [x+1 for x in range(10) if x < 5]

a=["cat","dog","shark"]
r=[x.upper() for x in a]

r=[len(x) for x in a]

#  3        2           3     1
r=[x if len(x)<=3 else -1 for x in a]


a={"name":"python","age":20}
a["sight"]=1.5 # {"name":"python","age":20, "sight":1.5}
a["age"]=30 # {"name":"python","age":30, "sight":1.5}

a.keys() # ['name', 'age', 'sight']
a.values() # ['python', 30, 1.5]
a.items() # [('name', 'python'), ('age', 30), ('sight', 1.5)]

for e in a:
    #print(f"e:{e}") # key 만 나옴
    pass

for e,f in a.items():
    print(f"e:{e}, f:{f}")

people=[{"name":"pepe","age":14},{"name":"momo","age":20}
        ,{"name":"bobo","age":17}]
"""
people 에 있는 사람들이 담배를 사려고 한다.
나이는 19세 이상만 판매 가능하다.
각 사람의 나이를 보고 자격 미달이면 "{name}에게는 판매를 할수 없습니다" 
를 출력하시오
"""
for e in people:
    if e["age"]<19:
        #print(f"{e["name"]}에게는 담배를 판매할수 없습니다")
        pass

if True:
    1
elif True:
    2
else:
    3

# 함수를 선언한다
def f1():
    1-1
    return 1

a=f1() # 함수를 호출한다

# 파이썬에선 매개변수에 기본값 설정이 가능 합니다
def f2(n1=0,n2=0,n3=0,n4=0):
    return n1*n2*n3*n4

# 매개변수에 기본값을 설정하면, 모든 값을 다 줄 필요 없다
f2(n4=9,n2=1)

def sum_num(n):
    if n<=1:
        return 1
    return n+sum_num(n-1)

r=sum_num(5)

# 이건 난이도 극악 재귀함수
def test(n):
    if n<=0:
        return
    # 재귀함수 전에 있으니 바로 실행
    print("시작:",n)
    test(n-1)
    # 재귀함수 끝나고 나서 실행
    print("끝:",n)

"""
시작: 3
시작: 2
시작: 1
끝: 1
끝: 2
끝: 3
"""
test(3)