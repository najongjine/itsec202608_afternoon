"""
1~45 개의 숫자
숫자는 서로 중복이 안됨(비복원 추출)

총 6개 뽑음
"""

#랜덤숫자 만들기. 1~45
import random
nums=[]
for i in range(6):
    x=random.randint(1,46)
    nums.append(x)
print(f"nums:{nums}")
