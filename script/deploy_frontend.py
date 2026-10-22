import os
import sys
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

    local_fe = os.path.abspath("frontend_dist.zip")
    remote_fe = "/root/frontend_dist.zip"
    print(f"\nUploading frontend: {local_fe} -> {remote_fe}")
    sftp.put(local_fe, remote_fe, callback=print_progress)
    print("\nFrontend upload complete.")
    sftp.close()

    print("\nDeploying frontend to /var/www/frontend ...")
    cmd_fe = "rm -rf /var/www/frontend/* && unzip -o /root/frontend_dist.zip -d /var/www/frontend/ && docker restart nginx-proxy"
    stdin, stdout, stderr = ssh.exec_command(cmd_fe)
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err:
        print("[FE Error/Warning]:", err)

    ssh.close()
    print("\n=== FRONTEND DEPLOYED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
