people=[]
class Person:
    def __init__(self,name="",id=0,money=0):
        self.name=name
        self.money=money
        self.id=id
    def transmoney(self,other_person,money=0,):
        self.money=self.money-money
        other_person.money=other_person.money+money
    def plusmoney(self,money):
        self.money=self.money+money
    def showmyaccount(self):
        print(f"""
            id:{self.id},
            name:{self.name},
            money:{self.money}
        """)
    def withdraw(self):
        pass

def make_account(name="",money=0):
    newname=input("이름을 입력하세요:")
    newperson=Person(name=name,money=money)
    newperson.id=len(people)+1
    people.append(newperson)
    pass

def show_all_account():
    for e in people:
        e.showmyaccount()

menu=input("""
    1. 계정생성
    2. 송금
    3. 입금
    메뉴를 골라주세요:
    """)