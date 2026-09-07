import urllib.request, json
try:
    req = urllib.request.Request("http://localhost:8080/api/auth/login", data=json.dumps({"email":"prof@uniconnect.ro","password":"password"}).encode("utf-8"), headers={"Content-Type":"application/json"})
    token = json.loads(urllib.request.urlopen(req).read())["token"]
    req = urllib.request.Request("http://localhost:8080/api/attendance/course/3", headers={"Authorization":f"Bearer {token}"})
    print(urllib.request.urlopen(req).read().decode("utf-8"))
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
