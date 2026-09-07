# 버블정렬
a=[1,9,7,6]

for d in range(len(a)-1):
    for index in range(len(a)-1):
        if a[index] > a[index+1]:
            a[index],a[index+1]=a[index+1],a[index]


print(f"a:{a}")