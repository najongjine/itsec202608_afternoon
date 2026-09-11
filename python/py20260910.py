"""
1~45 개의 숫자
숫자는 서로 중복이 안됨(비복원 추출)

총 6개 뽑음
"""

#랜덤숫자 만들기. 1~45
import random
nums=set()
for i in range(9999):
    x=random.randint(1,45)
    nums.add(x)
    if len(nums) >= 6:
        break
"""
set는 중복을 자동으로 제거해서 편하지만, 순서개념이 없어요
list(배열)은 중복 재거 개념이 없지만, 순서 개념이 있어요
"""
nums=list(nums)
nums.sort()
print(f"nums:{nums}")