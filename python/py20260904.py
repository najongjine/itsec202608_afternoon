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