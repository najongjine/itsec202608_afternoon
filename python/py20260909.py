# BMI 계산기
"""
BMI 계산해주는 함수를 만들어 보세요
키: 170cm -> 1.70m
몸무게: 65kg
BMI = 65/(1.70 * 1.70)
키는 cm로 입력 받았다 칩시다. 몸무게는 kg 으로 입력 받았다 치고.
"""
def bmi(키,몸무게):
    키=키/100
    bmi=몸무게/(키*키)
    return bmi

x=bmi(160,70)


"""
랜덤 숫자 만들기
"""
import random
# 1~9998 중 랜덤 정수 만들기
x=random.randint(1,9999)

"""
랜덤으로 만들어진 x가 홀수인지 짝수인지 판단하는 함수 만들기
"""
def beven(num):
    str1="짝수"
    if num%2==0:
        str1="짝수"
    else:
        str1="홀수"
    return str1

#print(f"{x}:{beven(x)}")

"""
고대 시절에선 소수(prime number) 를 만들어내거나 판단하는 수식을
찾는게 불가능했어요
1 3 5 7 11 13 17
"""
def bprime(num):
    bprime=True
    for i in range(2,num): # 2 ~ num-1
        if num%i == 0:
            bprime=False
    return bprime

x=97896
print(f"{x}는 소수인가?:{bprime(x)}")