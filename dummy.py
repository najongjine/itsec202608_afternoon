def process_data(items):
    part = items[2:5]
    output = []
    for x in part:
        output.append(x + '-Tested')
    return output
data = ['p', 'q', 'r', 's', 't', 'u']
res1 = process_data(data)
res2 = res1[0].split('e')
print(res2[1])