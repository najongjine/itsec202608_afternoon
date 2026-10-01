people=[]
myaccount=None
class Person:
    def __init__(self,name="",id=0,money=0):
        self.name=name
        self.money=money
        self.id=id
    def transmoney(self,other_person_id=0,money=0):
        other_person = next(filter(lambda p: p.id == other_person_id, people), None)
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

def make_account(name="",money=0,b_myaccount=False):
    if myaccount:
        name=input("이름을 입력하세요:")
    newperson=Person(name=name,money=money)
    newperson.id=len(people)+1
    people.append(newperson)
    pass

def show_all_account():
    for e in people:
        e.showmyaccount()

make_account(name="pepe",money=5000)
make_account(name="bobo",money=15000)
make_account(name="momo",money=1000)

while True:
    menu=input("""
        1. 계정생성
        2. 송금
        3. 입금
        4. 전체계정 조회
        메뉴를 골라주세요:
        """)
    match menu:
        case 1:
            make_account()
        case 2:
            other_person_id=int(input("상대방의 id:"))
            money=int(input("보낼 금액:"))
            myaccount.transmoney(other_person_id=other_person_id,money=money)
        case 3:
            money=int(input("입금할 금액:"))
            myaccount.plusmoney(money=money)
        case 4:
            show_all_account()

