import os
import sys
import time
import paramiko

SERVER_IP = "169.58.138.247"
USERNAME = "root"
PASSWORD = "SalamBaku123"

def print_progress(transferred, total):
    percent = (transferred / total) * 100
    mb_transferred = transferred / (1024 * 1024)
    mb_total = total / (1024 * 1024)
    sys.stdout.write(f"\rUploaded: {mb_transferred:.2f}MB / {mb_total:.2f}MB ({percent:.1f}%)")
    sys.stdout.flush()

def main():
    print("Connecting to server...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=15)
    print("Connected to SSH.")

    sftp = ssh.open_sftp()
    print("SFTP channel opened.")

    # 1. Upload frontend_dist.zip
    local_fe = os.path.abspath("frontend_dist.zip")
    remote_fe = "/root/frontend_dist.zip"
    print(f"\nUploading frontend: {local_fe} -> {remote_fe}")
    sftp.put(local_fe, remote_fe, callback=print_progress)
    print("\nFrontend upload complete.")

    # 2. Upload backend jar
    local_be = os.path.abspath("backend/build/libs/modern-dentistry-1.0.0.jar")
    remote_be = "/root/backend/build/libs/modern-dentistry-1.0.0.jar"
    print(f"\nUploading backend JAR: {local_be} -> {remote_be}")
    # Backup previous jar first
    ssh.exec_command("cp /root/backend/build/libs/modern-dentistry-1.0.0.jar /root/backend/build/libs/modern-dentistry-1.0.0.jar.bak 2>/dev/null")
    sftp.put(local_be, remote_be, callback=print_progress)
    print("\nBackend JAR upload complete.")

    sftp.close()

    # 3. Deploy Frontend on server
    print("\nDeploying frontend to /var/www/frontend ...")
    cmd_fe = "rm -rf /var/www/frontend/* && unzip -o /root/frontend_dist.zip -d /var/www/frontend/ && docker restart nginx-proxy"
    stdin, stdout, stderr = ssh.exec_command(cmd_fe)
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err:
        print("[FE Error/Warning]:", err)

    # 4. Deploy Backend on server
    print("\nRebuilding and restarting backend container...")
    cmd_be = "cd /root/backend && docker compose build modern-dentistry && docker compose up -d modern-dentistry"
    stdin, stdout, stderr = ssh.exec_command(cmd_be)
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err:
        print("[BE Output/Notice]:", err)

    # 5. Check logs
    print("\nWaiting 10 seconds for backend initialization...")
    time.sleep(10)
    stdin, stdout, stderr = ssh.exec_command("docker logs --tail 40 modern-dentistry")
    print("\n=== MODERN-DENTISTRY LOGS ===")
    print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()
    print("\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
