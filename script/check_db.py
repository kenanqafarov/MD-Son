import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('169.58.138.247', username='root', password='SalamBaku123')

def query(sql):
    cmd = f"docker exec postgres-db psql -U postgres -d modern_dentistry -c \"{sql}\""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(f"=== {sql} ===")
    print(stdout.read().decode('utf-8'))
    err = stderr.read().decode('utf-8')
    if err:
        print("ERR:", err)

query("SELECT * FROM authorities LIMIT 10;")
query("SELECT id, name, surname, username FROM base_users LIMIT 5;")

ssh.close()
