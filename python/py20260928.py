
a=10
#print(hex(a)) #파이썬에서 16진수 출력
#print(bin(a)) # 파이썬에서 2진수 출력

"""
input 은 입력 받는 함수
input으로 입력받은 것은 전부 문자열이다.
숫자로 취급하고 싶은경우 int나 float으로 형변환 시켜줘야 한다
"""
#a=input("입력하세요:")
#a=int(a)

#print('a','b','c',sep=" ") # a?b?c
#print("aaa",end="?")
#print("aaa",end="?") # aaa?aaa?

"""
c랑 java는 정수/정수 하면 정수였는데
파이썬은 그런거 없어요
"""
a=1
b=2
#print(a/b) # 소수점까지 표현
#print(a//b) # 소수점 버리기

a^b # 이건 xor 연산
a**b # 제곱연산

a=1
b=1
c=1

0<=a<=10
0<=a and a<=10

a="""
it's high noon. good day to die.
"""
search="day"
# 우리가 찾으려는 search의 값이 a 안에 있니?
search in a
# 우리가 찾으려는 search의 값이 a 안에 없니?
search not in a

a=[1,2,3,4,5]
search=1
search in a

age=17
money=30000
ticket_price=25000
blacklist=["철수","영희","민수"]
name="준호"

"""
- 나이가 14세 이상인지 확인한다
- 가진돈이 입장권 가격 이상인지 확인한다
- 이름이 blacklist 안에 포함되어 있지 않은지 확인한다
- 입장권을 사고 난 뒤 남는 돈을 계산한다
"""
# 이걸 방화벽 패턴이라고 합니다
"""
if age< 17:
    print(f"나이 자격 안됨")
    exit() # 프로그램 종료 코드
if money < ticket_price:
    print(f"돈 부족함")
    exit()
if name in blacklist:
    print(f"블랙리스트에 올라가있습니다")
    exit()
print(f"남은금액:{money-ticket_price}")
"""

"""
Sequence 자료형: 순서가 있는 데이터
"""
[1,2,3] # list
"greeting" # 문자열
{1,2,3} # set
(1,2,3) # 튜플

a=[1,2,3,4]
a[1:3] # 인덱스 1부터 3 전까지, 즉 "2,3"
a.append(9) # a 리스트 뒤에다가 9를 추가해라
a.append([1,2]) # [1,2,3,4,9,[1,2]]
a.extend([3,4]) # [1,2,3,4,9,[1,2],3,4]
a.insert(2,7) # [1, 2, 7, 3, 4, 9, [1, 2], 3, 4]

