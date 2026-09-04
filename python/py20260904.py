a ="a"
match a:
    case 'a':
        #print('a')
        pass
    case 'b':
        #print('b')
        pass
    case _:
        #print("몰라")
        pass

person={
    "name":"pepe"
    ,"age":30
    ,"city":"서울"
}
# key 만 i에 담김
for i in person:
    print(f"i:{i}")
# value만 i에 담김
for i in person.values():
    print(f"i:{i}")
# key는 i, value는 v에 담김
for i,v in person.items():
    print(f"i:{i}, v:{v}")


a=[5,3]
# a 라는 list에서 5 와 3의 위치를 바꿔보세요
_a=a[0]
a[0]=a[1]
a[1]=_a

a=[5,3]
# 이건 파이썬에만 있는 자리 바꾸기 문법
a[0],a[1]=a[1],a[0]
print(f"a:{a}")


a=[1,2]
# 0번째 자리와 1번째 자리를 비교해서, 0번째 자리가 크면
# 서로 자리 바꾸세요(if 사용)