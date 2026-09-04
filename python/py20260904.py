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
for i in person:
    print(f"i:{i}")