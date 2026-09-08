# 자료결합도

def swap(a,b):
    a,b=b,a

a=1
b=2
swap(a,b)
#print(f"a:{a},b:{b}")

# stamp 결합도
a=[1,2]
def swap2(a):
    a[0],a[1]=a[1],a[0]
swap2(a)
print(a)