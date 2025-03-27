
# def dataFromFile(fname):
    # """Function which reads from the file and yields a generator"""
with open("car.data", "r") as f:
    d = {'buying' : {'vhigh' : 0, 'high' : 0, 'med' : 0, 'low' : 0}, 'maint' : {'vhigh' : 0, 'high' : 0, 'med' : 0, 'low' : 0}
    , 'doors' : {'2' : 0, '3' : 0, '4' : 0, '5more' : 0}, 'persons' : {'2' : 0, '4' : 0, 'more' : 0}, 'lug_bt' : {'small' : 0, 'med' : 0, 'big' : 0}
    , 'safety' : {'low' : 0, 'med' : 0, 'high' : 0}}
    for line in f:
        line = line.split(',')[:-1]
        d['buying'][line[0]] += 1
        d['maint'][line[1]] += 1
        d['doors'][line[2]] += 1
        d['persons'][line[3]] += 1
        d['lug_bt'][line[4]] += 1
        d['safety'][line[5]] += 1
    print(d)
            # line = line.strip().rstrip(",")  # Remove trailing comma
            # record = frozenset(line.split()[3:])
            # yield record

            
# if __name__ == "__main__":

# inFile = dataFromFile(options.input)
# print(inFile)