import re
import json

file = open('./assets_source/commands.csv', 'r')
content = file.read()

json_output = {}

for line in content.splitlines():
    if 'levelname' in line:
        result = re.search('levelname;(.*)', line)
        levelname = result.group(1)
        json_output[levelname] = []

    else:
        split = line.split(';')
        json_output[levelname].append({})
        index = len(json_output[levelname]) - 1

        json_output[levelname][index]['command'] = split[0]
        json_output[levelname][index]['time'] = int(split[1])

file.close()

output_file = open('./dist/assets/commands.json', 'w+')
output_file.write(json.dumps(json_output, separators=(",", ":")))
output_file.close()