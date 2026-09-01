"""
tuple. 그렇게 안중요함.
tuple은 원소 수정이 불가능함

list [] 이건 원소수정, 변경 삭제 맘대로 다 가능
set {} 이건 함수를 통해서만 추가 삭제 가능
"""
a=(1,2,4)
print(f"a[0]:{a[0]}")

"""
dictionary. Java 에서는 Map<> 이라고 부름
key : value 쌍으로 구성되 있음
"""
b={1,3,5} # set
a={"key1":1,"key2":"hello"} # dictionary
a['멍멍']="크르릉"
a.update({"멍멍":"크르릉"})
a['key1']=123
del(a['멍멍'])

# dictionary 에서 key 이름만 싹 뽑아내기
keys=a.keys() # dict_keys(['key1', 'key2'])
dvalues=a.values() # dict_values([123, 'hello'])

"""
파이썬의 if문 조건 c언어 개념 남아 있어요
0, None, "", {}, [], () 이건 false
나머진 true

java, c 는 scope(영역) 개념이 있어요
python은 scope(영역) 개념이 없어요
"""
a=1
b=a-3 # 1-3 = -2
if a==b: 
    c=2
print(f"c:{c}")