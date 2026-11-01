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

query("SELECT id, company_name, phone_number, status FROM insurance_companies;")
query("SELECT id, category_name, category_code, insurance_company_id FROM op_types;")
query("SELECT count(*) FROM op_type_items;")
query("SELECT id, patient_id, insurance_id, plan_name FROM patient_plans_main LIMIT 5;")

ssh.close()
