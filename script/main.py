import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import re
import requests

BASE_URL = "http://169.58.138.247/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"
CREATE_URL = f"{BASE_URL}/add-worker/create"

ADMIN_CREDENTIALS = {
    "username": "super_admin",
    "password": "super1234"
}

def get_auth_token():
    """Super admin girişi edərək aktiv JWT token əldə edir"""
    try:
        response = requests.post(LOGIN_URL, json=ADMIN_CREDENTIALS, timeout=10)
        response.raise_for_status()
        data = response.json()
        token = data.get("tokenPair", {}).get("accessToken")
        if not token:
            raise ValueError("Cavabda accessToken tapılmadı")
        return token
    except Exception as e:
        print(f"Giriş xətası (Login failed): {e}")
        sys.exit(1)

WORKERS_DATA = [
    # Həkim bölməsi
    {
        "name": "Namiq",
        "surname": "Çobanov",
        "dob": "1975-07-23",
        "phone": "0503262109",
        "gender": "MAN",
        "role": "Həkim",
    },
    {
        "name": "Orxan",
        "surname": "Süleymanov",
        "dob": "1986-09-21",
        "phone": "0506886218",
        "gender": "MAN",
        "role": "Həkim",
    },
    {
        "name": "Hüseyn",
        "surname": "Fərzəliyev",
        "dob": "1988-04-08",
        "phone": "0505662957",
        "gender": "MAN",
        "role": "Həkim",
    },
    {
        "name": "Ramik",
        "surname": "Mustafayev",
        "dob": "1991-06-23",
        "phone": "0705796640",
        "gender": "MAN",
        "role": "Həkim",
    },
    {
        "name": "Cəmilə",
        "surname": "Feyzullayeva",
        "dob": "1980-07-12",
        "phone": "0553222290",
        "gender": "WOMAN",
        "role": "Həkim",
    },
    {
        "name": "Ruhiyyə",
        "surname": "Ağayeva",
        "dob": "1976-12-03",
        "phone": "0558733066",
        "gender": "WOMAN",
        "role": "Həkim",
    },
    {
        "name": "Elmira",
        "surname": "Əliyeva",
        "dob": "1997-03-02",
        "phone": "0504617978",
        "phone3": "0508507008",
        "gender": "WOMAN",
        "role": "Həkim",
    },
    {
        "name": "Jalə",
        "surname": "Hüseynova",
        "dob": "1984-10-31",
        "phone": "0505582123",
        "gender": "WOMAN",
        "role": "Həkim",
    },
    {
        "name": "Günay",
        "surname": "Quliyeva",
        "dob": "2002-09-14",
        "phone": "0507052488",
        "gender": "WOMAN",
        "role": "Həkim",
    },
    {
        "name": "Vüsal",
        "surname": "Əsgərov",
        "dob": "1993-06-05",
        "phone": "0558414399",
        "gender": "MAN",
        "role": "Həkim",
    },
    {
        "name": "Rövşən",
        "surname": "İbrahimov",
        "dob": "1978-11-07",
        "phone": "0707571575",
        "gender": "MAN",
        "role": "Həkim",
    },
    {
        "name": "Əminə",
        "surname": "Abdullayeva",
        "dob": "1997-09-20",
        "phone": "0513739385",
        "gender": "WOMAN",
        "role": "Həkim",
    },
    # Resepşn bölməsi
    {
        "name": "Mirvari",
        "surname": "Rəsulova",
        "dob": "1978-04-18",
        "phone": "0555500503",
        "gender": "WOMAN",
        "role": "Resepşn",
    },
    {
        "name": "Aytən",
        "surname": "Behbudova",
        "dob": "1985-06-09",
        "phone": "0553159944",
        "gender": "WOMAN",
        "role": "Resepşn",
    },
    {
        "name": "Səadət",
        "surname": "Kərimova",
        "dob": "1975-12-28",
        "phone": "0559751228",
        "gender": "WOMAN",
        "role": "Resepşn",
    },
    {
        "name": "Samirə",
        "surname": "Rəhmanova",
        "dob": "1986-05-26",
        "phone": "0553961051",
        "gender": "WOMAN",
        "role": "Resepşn",
    },
    {
        "name": "Venera",
        "surname": "Həmidova",
        "dob": "1988-03-05",
        "phone": "0502771172",
        "gender": "WOMAN",
        "role": "Resepşn",
    },
    # T/B bölməsi
    {
        "name": "Lalə",
        "surname": "Məmmədova",
        "dob": "1983-06-29",
        "phone": "0773600046",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Xəyalə",
        "surname": "Ağayeva",
        "dob": "1985-03-26",
        "phone": "0555095785",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Xəyalə",
        "surname": "Ağayeva",
        "dob": "1986-02-23",
        "phone": "0559410477",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Tünzalə",
        "surname": "Şirinova",
        "dob": "1982-08-19",
        "phone": "0558587801",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Vüsalə",
        "surname": "Həsənova",
        "dob": "1985-12-20",
        "phone": "0708766470",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Rəhimə",
        "surname": "Vəlimətova",
        "dob": "1980-05-27",
        "phone": "0702052780",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Nərgiz",
        "surname": "Amaxanova",
        "dob": "1997-08-18",
        "phone": "0514754995",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Ramilə",
        "surname": "Vəliyeva",
        "dob": "1992-12-12",
        "phone": "0552957710",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Əsra",
        "surname": "Namazova",
        "dob": "2004-09-10",
        "phone": "0998872917",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Naidə",
        "surname": "Məmmədova",
        "dob": "2006-02-24",
        "phone": "0513863288",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Fidan",
        "surname": "Bağırlı",
        "dob": "2005-11-25",
        "phone": "0775933213",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Könül",
        "surname": "Bağırlı",
        "dob": "1984-04-03",
        "phone": "0556945413",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Natavan",
        "surname": "Xudaverdiyeva",
        "dob": "1983-11-03",
        "phone": "0512071109",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Səidə",
        "surname": "Şalbuzova",
        "dob": "1985-04-16",
        "phone": "0559691633",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Aysel",
        "surname": "Quliyeva",
        "dob": "1991-02-01",
        "phone": "0703302752",
        "gender": "WOMAN",
        "role": "T/B",
    },
    {
        "name": "Gülnarə",
        "surname": "Əliyeva",
        "dob": "1976-11-21",
        "phone": "0503276669",
        "gender": "WOMAN",
        "role": "T/B",
    },
    # Qadınlar bölməsi
    {
        "name": "Cəmilə",
        "surname": "Abdurzayeva",
        "dob": "1968-02-08",
        "phone": "0557524952",
        "gender": "WOMAN",
        "role": "Sanitarka",
    },
    {
        "name": "Aidə",
        "surname": "Şıxəliyeva",
        "dob": "1966-12-12",
        "phone": "0513064494",
        "gender": "WOMAN",
        "role": "Sanitarka",
    },
    {
        "name": "Hicran",
        "surname": "Xankişiyeva",
        "dob": "1976-12-15",
        "phone": "0558620696",
        "gender": "WOMAN",
        "role": "Sanitarka",
    },
    {
        "name": "Vasilə",
        "surname": "Məmmədova",
        "dob": "1976-05-03",
        "phone": "0556542929",
        "gender": "WOMAN",
        "role": "Sanitarka",
    },
    # Əl ilə yazılmış alt hissə
    {
        "name": "Aneta",
        "surname": "Səfərəliyeva",
        "dob": "1976-01-20",
        "phone": "0502433393",
        "gender": "WOMAN",
        "role": "Sanitarka",
    },
]


def to_latin(text):
    """Azərbaycan şriftlərini latın hərflərinə çevirir və balaca hərf edir"""
    trans = str.maketrans("ƏIÖÜŞÇĞəıöüşçğ", "eiouscgeiouscg")
    return text.translate(trans).lower().strip()


def clean_surname(surname):
    """Soyadı yalnız a-z hərflərinə salır"""
    cleaned = to_latin(surname)
    return re.sub(r"[^a-z]", "", cleaned)


def format_phone(phone_str):
    """Nömrəni (050)-123-45-67 formatına salır"""
    digits = re.sub(r"\D", "", phone_str)
    if len(digits) == 10 and digits.startswith("0"):
        return f"({digits[:3]})-{digits[3:6]}-{digits[6:8]}-{digits[8:]}"
    elif len(digits) == 9:
        digits = "0" + digits
        return f"({digits[:3]})-{digits[3:6]}-{digits[6:8]}-{digits[8:]}"
    return f"({digits[:3]})-{digits[3:6]}-{digits[6:8]}-{digits[8:]}"


def send_workers():
    token = get_auth_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }
    used_usernames = set()

    for index, worker in enumerate(WORKERS_DATA, start=1):
        first_letter = to_latin(worker["name"])[0]
        surname_clean = clean_surname(worker["surname"])

        # Yalnız hərflərdən ibarət ad (məs: ncobanov)
        base_username = f"{first_letter}{surname_clean}"
        username = base_username

        # Əgər eyni username təkrar olunarsa, sonuna hərflər artırılır (məs: xagayevaa)
        repeat_count = 1
        while username in used_usernames:
            username = f"{base_username}{'a' * repeat_count}"
            repeat_count += 1

        used_usernames.add(username)

        # Ata adı boş ola bilməz (min 3 hərf)
        patronymic = "null"

        formatted_phone = format_phone(worker["phone"])
        formatted_phone3 = (
            format_phone(worker["phone3"]) if worker.get("phone3") else ""
        )

        role = worker.get("role", "")
        if role == "Həkim":
            # Həkim həm Həkim rolu alır, həm də sistem təqvimi üçün DOCTOR icazəsi
            worker_permissions = ["Həkim", "DOCTOR"]
        elif role:
            worker_permissions = [role]
        else:
            worker_permissions = []

        password = f"{first_letter.upper()}.{surname_clean}1!"

        payload = {
            "username": username,
            "password": password,
            "name": worker["name"],
            "surname": worker["surname"],
            "patronymic": patronymic,
            "finCode": "",
            "colorCode": "string",
            "genderStatus": worker["gender"],
            "dateOfBirth": worker["dob"],
            "degree": "string",
            "phone": formatted_phone,
            "phone2": "",
            "phone3": formatted_phone3,
            "homePhone": "",
            "email": "",
            "address": "string",
            "experience": 0,
            "permissions": worker_permissions,
        }

        try:
            response = requests.post(
                CREATE_URL, headers=headers, json=payload, timeout=10
            )

            if response.status_code in (200, 201):
                print(
                    f"[{index}/{len(WORKERS_DATA)}] [{username}] (Şifrə: {password}) Uğurla əlavə olundu: {worker['name']} {worker['surname']}"
                )
            else:
                print(
                    f"[{index}/{len(WORKERS_DATA)}] [{username}] Xəta ({response.status_code}): {response.text}"
                )

        except Exception as e:
            print(
                f"[{index}/{len(WORKERS_DATA)}] [{username}] Qoşulma xətası: {str(e)}"
            )


if __name__ == "__main__":
    send_workers()