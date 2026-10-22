import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests

BASE_URL = "http://169.58.138.247/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"

ADMIN_CREDENTIALS = {
    "username": "super_admin",
    "password": "super1234"
}

def get_auth_token():
    resp = requests.post(LOGIN_URL, json=ADMIN_CREDENTIALS, timeout=10)
    resp.raise_for_status()
    return resp.json()["tokenPair"]["accessToken"]

# All items transcribed from the 4 photos
STOCK_ITEMS = [
    # --- Photo 1 ---
    {"name": "Artinibsa (1paçx50əd)", "price": 50.0, "quantity": 50},
    {"name": "Anbar-bond", "price": 30.0, "quantity": 50},
    {"name": "Alvanes", "price": 25.0, "quantity": 20},
    {"name": "Air Flow", "price": 50.0, "quantity": 10},
    {"name": "Apeksident", "price": 12.0, "quantity": 10},
    {"name": "Aplikator (orta)", "price": 5.0, "quantity": 100},
    {"name": "Aplikator (böyük)", "price": 5.0, "quantity": 100},
    {"name": "Aplikator (balaca)", "price": 5.0, "quantity": 100},
    {"name": "Adgezor fine", "price": 25.0, "quantity": 50},
    {"name": "Bond (qırmızı)", "price": 30.0, "quantity": 50},
    {"name": "Bor (podşeyka)", "price": 1.0, "quantity": 1},
    {"name": "Bor (tərs konus)", "price": 1.2, "quantity": 1},
    {"name": "Bor (yolka)", "price": 1.0, "quantity": 1},
    {"name": "Bor (damla)", "price": 1.0, "quantity": 1},
    {"name": "Bor (fissur)", "price": 1.0, "quantity": 1},
    {"name": "Bor (şaravidnıy)", "price": 1.0, "quantity": 1},
    {"name": "Bor (mikromotor)", "price": 1.2, "quantity": 1},
    {"name": "Bor (tverdıy splav)", "price": 1.5, "quantity": 1},
    {"name": "Bor (kist)", "price": 1.5, "quantity": 1},
    {"name": "Bor (rezin)", "price": 1.5, "quantity": 1},
    {"name": "Bor koronka rez", "price": 5.0, "quantity": 1},
    {"name": "Valik", "price": 7.0, "quantity": 600},
    {"name": "Qutta № 15", "price": 6.0, "quantity": 120},
    {"name": "Qutta № 20", "price": 6.0, "quantity": 120},
    {"name": "Qutta № 25", "price": 6.0, "quantity": 120},
    {"name": "Qutta № 30", "price": 6.0, "quantity": 120},
    {"name": "Qutta № 35", "price": 6.0, "quantity": 120},
    {"name": "Qutta № 40", "price": 6.0, "quantity": 60},
    {"name": "Qutta № 45", "price": 6.0, "quantity": 60},
    {"name": "Qutta № 50", "price": 6.0, "quantity": 60},
    {"name": "Qutta № 55", "price": 6.0, "quantity": 60},
    {"name": "Qutta (nabor)", "price": 6.0, "quantity": 60},
    {"name": "Qranulatec", "price": 180.0, "quantity": 100},
    {"name": "Qips", "price": 36.0, "quantity": 1},
    {"name": "Dental yağ", "price": 15.0, "quantity": 70},
    {"name": "Devit C", "price": 6.0, "quantity": 50},
    {"name": "Dentin", "price": 5.0, "quantity": 80},
    {"name": "Dentin (orafil-g)", "price": 7.0, "quantity": 10},
    {"name": "Dentlayt flo", "price": 7.0, "quantity": 1},
    {"name": "Disk (yaşıl)", "price": 7.0, "quantity": 1},
    {"name": "Disk (ağ)", "price": 7.0, "quantity": 1},
    {"name": "Disk (sarı)", "price": 7.0, "quantity": 1},
    {"name": "Disk (göy)", "price": 7.0, "quantity": 1},

    # --- Photo 2 ---
    {"name": "Praym gel", "price": 15.0, "quantity": 50},
    {"name": "Endo peper № 20", "price": 7.0, "quantity": 100},
    {"name": "Endo peper № 25", "price": 7.0, "quantity": 100},
    {"name": "Endo peper № 30", "price": 7.0, "quantity": 100},
    {"name": "Peper № 15", "price": 6.0, "quantity": 200},
    {"name": "Peper № 20", "price": 6.0, "quantity": 200},
    {"name": "Peper № 25", "price": 6.0, "quantity": 200},
    {"name": "Peper № 30", "price": 6.0, "quantity": 200},
    {"name": "Peper № 35", "price": 6.0, "quantity": 200},
    {"name": "Peper № 40", "price": 6.0, "quantity": 200},
    {"name": "Poloskiy № 1.054", "price": 5.0, "quantity": 10},
    {"name": "Poloskiy (metal)", "price": 5.0, "quantity": 15},
    {"name": "Pulpoekstraktor", "price": 20.0, "quantity": 100},
    {"name": "Repin evginolsuz", "price": 40.0, "quantity": 100},
    {"name": "Repin", "price": 30.0, "quantity": 150},
    {"name": "Spreyder", "price": 7.0, "quantity": 6},
    {"name": "Super gibs", "price": 15.0, "quantity": 1},
    {"name": "Skaypel ucluğu № 11", "price": 15.0, "quantity": 100},
    {"name": "Skaypel ucluğu № 15", "price": 15.0, "quantity": 100},
    {"name": "Turşu (sarı)", "price": 90.0, "quantity": 100},
    {"name": "Ştift M1, M2, M3", "price": 5.0, "quantity": 10},
    {"name": "Ştift L1, L2, L3", "price": 5.0, "quantity": 10},
    {"name": "Ştift S1, S2, S3", "price": 5.0, "quantity": 10},
    {"name": "Turşu", "price": 9.0, "quantity": 25},
    {"name": "Xlonibsa", "price": 50.0, "quantity": 50},
    {"name": "Tempovit", "price": 130.0, "quantity": 80},
    {"name": "Filtec (pasta)", "price": 80.0, "quantity": 15},
    {"name": "Filtec Flow", "price": 15.0, "quantity": 1},
    {"name": "Fissurit", "price": 70.0, "quantity": 20},
    {"name": "Fayl K № 06", "price": 7.0, "quantity": 6},
    {"name": "Fayl K № 08", "price": 7.0, "quantity": 6},
    {"name": "Fayl K № 10", "price": 7.0, "quantity": 6},
    {"name": "Fayl K № 15", "price": 7.0, "quantity": 6},
    {"name": "Fayl K № 20", "price": 7.0, "quantity": 6},
    {"name": "Fayl K № 25", "price": 7.0, "quantity": 6},
    {"name": "Fayl K № 30", "price": 7.0, "quantity": 6},
    {"name": "Fayl K № 35", "price": 7.0, "quantity": 6},
    {"name": "Fayl K № 40", "price": 7.0, "quantity": 6},

    # --- Photo 3 ---
    {"name": "Fayl H № 08", "price": 7.0, "quantity": 6},
    {"name": "Fayl H № 10", "price": 7.0, "quantity": 6},
    {"name": "Fayl H № 15", "price": 7.0, "quantity": 6},
    {"name": "Fayl H № 20", "price": 7.0, "quantity": 6},
    {"name": "Fayl H № 25", "price": 7.0, "quantity": 6},
    {"name": "Fayl H № 30", "price": 7.0, "quantity": 6},
    {"name": "Fayl H № 35", "price": 7.0, "quantity": 6},
    {"name": "Fayl H № 40", "price": 7.0, "quantity": 6},
    {"name": "Filtec A 2", "price": 7.0, "quantity": 6},
    {"name": "Əlcək S (latex)", "price": 7.0, "quantity": 100},
    {"name": "Əlcək XS (latex)", "price": 7.0, "quantity": 100},
    {"name": "Əlcək M (latex)", "price": 7.0, "quantity": 100},
    {"name": "Əlcək S (nitril)", "price": 7.0, "quantity": 100},
    {"name": "Dizenfiktant (əl üçün)", "price": 27.0, "quantity": 300},
    {"name": "Ucluq (orta)", "price": 14.0, "quantity": 100},
    {"name": "Ucluq (balaca)", "price": 14.0, "quantity": 100},
    {"name": "Ucluq (böyük)", "price": 14.0, "quantity": 100},
    {"name": "Compozit", "price": 50.0, "quantity": 50},
    {"name": "Calsiy Hidroksid", "price": 10.0, "quantity": 30},
    {"name": "CX plus (böyük)", "price": 85.0, "quantity": 50},
    {"name": "Qradiya A 1", "price": 100.0, "quantity": 25},
    {"name": "Qradiya A 2", "price": 100.0, "quantity": 25},
    {"name": "Qradiya A 3", "price": 100.0, "quantity": 25},
    {"name": "Endo peper", "price": 7.0, "quantity": 1},
    {"name": "Endo qutda", "price": 7.0, "quantity": 1},
    {"name": "Fun", "price": 9.0, "quantity": 1},
    {"name": "Ucluq (sarı)", "price": 9.0, "quantity": 1},
    {"name": "Çarizma", "price": 125.0, "quantity": 20},
    {"name": "Estelayt flow", "price": 70.0, "quantity": 25},
    {"name": "Asteriya", "price": 170.0, "quantity": 50},
    {"name": "Riva", "price": 70.0, "quantity": 140},
    {"name": "Venberg", "price": 5.0, "quantity": 100},
    {"name": "Daseeng", "price": 10.0, "quantity": 6},
    {"name": "Kanal doldurucu", "price": 45.0, "quantity": 10},
    {"name": "Qrueles", "price": 25.0, "quantity": 25},
    {"name": "Filident", "price": 20.0, "quantity": 1},

    # --- Photo 4 ---
    {"name": "Disk sapı № 0", "price": 12.0, "quantity": 30},
    {"name": "Disk sapı № 00", "price": 12.0, "quantity": 30},
    {"name": "Disk sapı № 000", "price": 12.0, "quantity": 30},
    {"name": "Denfil A1 (plomb)", "price": 15.0, "quantity": 25},
    {"name": "Denfil A2 (plomb)", "price": 15.0, "quantity": 25},
    {"name": "Denfil A3 (plomb)", "price": 15.0, "quantity": 25},
    {"name": "Denfil Flow", "price": 15.0, "quantity": 25},
    {"name": "Endogel", "price": 6.0, "quantity": 30},
    {"name": "Endofayl (assorti)", "price": 30.0, "quantity": 6},
    {"name": "Endofayl (qırmızı)", "price": 30.0, "quantity": 6},
    {"name": "Endofayl (ağ)", "price": 30.0, "quantity": 6},
    {"name": "Endofayl (sarı)", "price": 30.0, "quantity": 6},
    {"name": "Evkalipt yağı", "price": 15.0, "quantity": 1},
    {"name": "Erqonon X", "price": 60.0, "quantity": 50},
    {"name": "Exosoft", "price": 25.0, "quantity": 14},
    {"name": "Exogel", "price": 20.0, "quantity": 140},
    {"name": "Endofill", "price": 100.0, "quantity": 90},
    {"name": "Calciy LC", "price": 36.0, "quantity": 50},
    {"name": "Klin (ağ)", "price": 4.0, "quantity": 20},
    {"name": "Klin (sarı)", "price": 4.0, "quantity": 20},
    {"name": "Klin (göy)", "price": 4.0, "quantity": 20},
    {"name": "Klin (qırmızı)", "price": 4.0, "quantity": 20},
    {"name": "Kapramin", "price": 8.0, "quantity": 30},
    {"name": "Kapirka (balaca)", "price": 10.0, "quantity": 20},
    {"name": "Krezodent", "price": 6.0, "quantity": 50},
    {"name": "İodent", "price": 15.0, "quantity": 50},
    {"name": "İodent (netverdiy)", "price": 15.0, "quantity": 50},
    {"name": "İseal", "price": 17.0, "quantity": 15},
    {"name": "Liss EA 2 (plomb)", "price": 15.0, "quantity": 25},
    {"name": "Liss EA 1 (plomb)", "price": 15.0, "quantity": 25},
    {"name": "Liss EA 3", "price": 15.0, "quantity": 25},
    {"name": "Liss DA 2", "price": 15.0, "quantity": 25},
    {"name": "Listerin", "price": 10.0, "quantity": 100},
    {"name": "Lidokain (sprey)", "price": 30.0, "quantity": 15},
    {"name": "MTA", "price": 15.0, "quantity": 15},
    {"name": "Mum (1paç x 10 əd)", "price": 7.0, "quantity": 50},
    {"name": "Maska", "price": 7.0, "quantity": 50},
    {"name": "Nurafler gel", "price": 2.0, "quantity": 50},
    {"name": "Önlük", "price": 8.0, "quantity": 50},
    {"name": "Otsos", "price": 8.0, "quantity": 50},
    {"name": "Pulpatec", "price": 170.0, "quantity": 40},
    {"name": "Pulposeptin", "price": 60.0, "quantity": 30},
    {"name": "Polish pasta", "price": 25.0, "quantity": 25},
    {"name": "Keer pasta", "price": 25.0, "quantity": 25},
]

def import_stock():
    print(f"Toplam {len(STOCK_ITEMS)} məhsul stoka əlavə ediləcək...")
    token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 1. Kateqoriyanı yoxla / yarat
    cats_res = requests.get(f"{BASE_URL}/product-category/read", headers=headers)
    cats = cats_res.json() if cats_res.status_code == 200 else []
    cat = next((c for c in cats if c.get("categoryName") == "Stomatoloji materiallar"), None)
    if not cat:
        create_cat_res = requests.post(f"{BASE_URL}/product-category/create", headers=headers, json={"categoryName": "Stomatoloji materiallar"})
        create_cat_res.raise_for_status()
        cat_id = create_cat_res.json()["id"]
        print(f"Yeni kateqoriya yaradıldı: Stomatoloji materiallar (ID: {cat_id})")
    else:
        cat_id = cat["id"]
        print(f"Mövcud kateqoriya tapıldı: Stomatoloji materiallar (ID: {cat_id})")

    # 2. Məhsulları yoxla / yarat
    prods_res = requests.get(f"{BASE_URL}/product/read", headers=headers)
    existing_prods = {p["productName"]: p for p in prods_res.json()} if prods_res.status_code == 200 else {}

    entry_products = []
    current_product_no = 1000

    for idx, item in enumerate(STOCK_ITEMS, start=1):
        name = item["name"]
        price = item["price"]
        quantity = item["quantity"]

        product_id = None
        if name in existing_prods:
            product_id = existing_prods[name]["id"]
        else:
            current_product_no += 1
            prod_payload = {
                "categoryId": cat_id,
                "productName": name,
                "productNo": current_product_no,
                "productTitle": name
            }
            create_prod_res = requests.post(f"{BASE_URL}/product/create", headers=headers, json=prod_payload)
            if create_prod_res.status_code in (200, 201):
                prod_data = create_prod_res.json()
                product_id = prod_data["id"]
                existing_prods[name] = prod_data
                print(f"[{idx}/{len(STOCK_ITEMS)}] Məhsul yaradıldı: {name} (Kod: {current_product_no})")
            else:
                print(f"[{idx}/{len(STOCK_ITEMS)}] Xəta ({create_prod_res.status_code}) məhsul: {name}: {create_prod_res.text}")
                continue

        entry_products.append({
            "categoryId": cat_id,
            "productId": product_id,
            "quantity": int(quantity),
            "price": float(price)
        })

    # 3. Anbara maddəxil (Warehouse entry) yarat
    if entry_products:
        print(f"\nAnbara maddəxil qeydiyyatı aparılır ({len(entry_products)} məhsul)...")
        entry_payload = {
            "date": "2026-10-12",
            "time": "12:00:00",
            "description": "Klinikanın ilkin stoku / İnventarizasiya",
            "warehouseEntryProductCreateRequests": entry_products
        }
        entry_res = requests.post(f"{BASE_URL}/warehouse-entry/create", headers=headers, json=entry_payload)
        if entry_res.status_code in (200, 201):
            res_json = entry_res.json()
            print(f"UĞURLU! Anbara maddəxil yaradıldı. Ümumi məbləğ: {res_json.get('sumPrice')} AZN")
        else:
            print(f"Anbara maddəxil xətası ({entry_res.status_code}): {entry_res.text}")

    # 4. Yoxlama
    stock_res = requests.get(f"{BASE_URL}/warehouse/read-warehouse", headers=headers)
    if stock_res.status_code == 200:
        stock = stock_res.json()
        print(f"\nKlinikanın stoku tamamlandı! Cəmi aktiv məhsul çeşidi stokda: {len(stock)}")
    else:
        print(f"Stok oxunarkən xəta: {stock_res.status_code}")

if __name__ == "__main__":
    import_stock()
