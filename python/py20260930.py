"""
자바 클래스는 뭐가 드럽게 많아요
"""
class Animal:
    def __init__(self):
        self.eye=2
        self.leg=4
        self.fur=True

    def makesound(self):
        print("크르릉")

animal=Animal()
animal2=animal
animal2.leg=1

"""
java, python 은
class, 배열, dictionary, map 같은 복잡 자료형은
포인터로 되있다
"""
a=[1,2]
b=a
b[0]=9


class ClassicCar:
    color="빨간색" # java의 static 변수
    def __init__(self):
        self.shape="큰모양"
    """
    def test(self):
        color="파란색"
        print(f"color={color}")
        print(f"self.color={self.color}")
    """

"""
클래스이름.스태틱변수 = 값
이렇게 하면 static 영역의 변수값이 바뀜
"""  
ClassicCar.color="검정"
father=ClassicCar()
father2=ClassicCar()
#print(father.color)
#print(father2.color)
"""
객체인스턴스.스태틱변수 = 값
이러면, 스태틱변수 값 바꾸는게 아니라, 필드를
하나 만들어버림
"""
father2.color="노랑"
#print(f"이후, father.color:{father.color}")
#print(f"이후, father2.color:{father2.color}")
#father.test()
#father.color="검은색"
#father.test()

class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def print_score(self):
        print(self.name, self.score)

s1 = Student("Kim", 80)
s2 = Student("Lee", 90)
s1.score += 10


class Counter:
    count = 0
    def __init__(self):
        Counter.count += 1
        self.num = Counter.count
a = Counter()
b = Counter()
c = Counter()

class Person:
    def __init__(self,name):
        self.name=name

class Student(Person):
    def __init__(self,age):
        self.age=10
    def welcome(self):
        print(f"age:{self.age}")

p1=Person()
s1=Student()
print(f"p1.name:{p1.name}")
print(f"s1.age:{s1.age}")