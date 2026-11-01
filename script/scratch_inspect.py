import sys
import json
from urllib.request import Request, urlopen

sys.stdout.reconfigure(encoding='utf-8')

req = Request('http://169.58.138.247/api/v1/auth/login', 
              data=json.dumps({'username': 'super_admin', 'password': 'super1234'}).encode(), 
              headers={'Content-Type': 'application/json'})
token = json.loads(urlopen(req).read().decode())['tokenPair']['accessToken']
headers = {'Authorization': f'Bearer {token}'}

for cat_id in [12, 13, 14, 15, 16]:
    url = f'http://169.58.138.247/api/v1/operation-type-items/read/{cat_id}'
    r = Request(url, headers=headers)
    data = json.loads(urlopen(r).read().decode())
    items = data.get('data', [])
    print(f'=== Category {cat_id} (count={len(items)}) ===')
    for it in items:
        print(f"  {it.get('id')}: {it.get('operationName')} | price: {it.get('price')}")
