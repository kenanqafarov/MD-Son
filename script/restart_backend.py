import paramiko
import time

SERVER_IP = "169.58.138.247"
USERNAME = "root"
PASSWORD = "SalamBaku123"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=15)

commands = [
    "docker-compose --version",
    "cd /root/backend && docker-compose build modern-dentistry",
    "cd /root/backend && docker-compose up -d modern-dentistry",
    "docker ps | grep modern-dentistry"
]

for cmd in commands:
    print(f"\n=== RUNNING: {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out:
        print("[STDOUT]:\n" + out)
    if err:
        print("[STDERR]:\n" + err)

print("\nWaiting 10s for Spring Boot startup logs...")
time.sleep(10)

stdin, stdout, stderr = ssh.exec_command("docker logs --tail 40 modern-dentistry")
print("\n=== RECENT DOCKER LOGS ===")
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
