a=[1,2]
b=a
# 연산자 오퍼레이팅 되면서 배열 새로 만들어요
a=a+[3]
print(f"a:{a}")
b.append(4)
print(f"b:{b}")
print(set(a)&set(b))