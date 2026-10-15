class good :
	li = ["seoul", "kyeonggi","inchon","daejeon","daegu","pusan"]

g = good()
str01 = '' # skiddp
for i in g.li:
	# "kyeonggi"
	# str01 = 's' + 'k'
	str01 = str01 + i[0]
    
print(str01)