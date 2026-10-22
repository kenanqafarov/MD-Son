#!/usr/bin/env python3
import argparse
import json
import os
import re
import sys
import time
import unicodedata
from decimal import Decimal
from typing import Any
from urllib.parse import urlencode
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_INPUT_FILE = os.path.join(SCRIPT_DIR, "pasted-text.txt")
if not os.path.exists(DEFAULT_INPUT_FILE):
    DEFAULT_INPUT_FILE = r"C:\Users\User\.codex\attachments\f059f06e-fe5b-481f-bc70-4c0aea7b3e8f\pasted-text.txt"


def get_auth_token(base_url: str = "http://169.58.138.247") -> str:
    """Super admin girişi edərək aktiv JWT token əldə edir"""
    url = f"{base_url.rstrip('/')}/api/v1/auth/login"
    payload = json.dumps({"username": "super_admin", "password": "super1234"}).encode("utf-8")
    req = Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            token = data.get("tokenPair", {}).get("accessToken")
            if not token:
                raise ValueError("Cavabda accessToken tapılmadı")
            return token
    except Exception as e:
        print(f"Giriş xətası (Login failed): {e}", file=sys.stderr)
        raise SystemExit(1)


def repair_mojibake(value: str) -> str:
    """Fix text that was UTF-8 but got interpreted as Latin-1/Windows-1252."""
    if not any(marker in value for marker in ("Ã", "Ä", "Å", "É")):
        return value.strip()

    fixed = value
    for encoding in ("latin1", "cp1252"):
        try:
            candidate = value.encode(encoding).decode("utf-8")
        except UnicodeError:
            continue
        if candidate.count("Ã") + candidate.count("Ä") + candidate.count("Å") < fixed.count("Ã") + fixed.count("Ä") + fixed.count("Å"):
            fixed = candidate

    replacements = {
        "É™": "ə",
        "É": "ə",
        "Ä±": "ı",
        "Ä°": "İ",
        "ÅŸ": "ş",
        "Åž": "Ş",
        "Ã¼": "ü",
        "Ãœ": "Ü",
        "Ã¶": "ö",
        "Ã–": "Ö",
        "Ã§": "ç",
        "Ã‡": "Ç",
        "ÄŸ": "ğ",
        "Äž": "Ğ",
    }
    for bad, good in replacements.items():
        fixed = fixed.replace(bad, good)
    return fixed.strip()


def make_code(prefix: str, index: int, name: str) -> str:
    transliteration = str.maketrans(
        {
            "ə": "e",
            "Ə": "E",
            "ı": "i",
            "I": "I",
            "İ": "I",
            "ş": "s",
            "Ş": "S",
            "ç": "c",
            "Ç": "C",
            "ö": "o",
            "Ö": "O",
            "ü": "u",
            "Ü": "U",
            "ğ": "g",
            "Ğ": "G",
        }
    )
    normalized = unicodedata.normalize("NFKD", name.translate(transliteration))
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^A-Za-z0-9]+", "_", ascii_text).strip("_").upper()
    slug = re.sub(r"_+", "_", slug)
    if not slug:
        slug = f"ITEM_{index}"
    return f"{prefix}_{index:03d}_{slug[:40]}"


def parse_amount(raw: str) -> Decimal:
    return Decimal(raw.replace(",", ".").strip())


def parse_input(text: str) -> list[dict[str, Any]]:
    categories: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    pending_name: str | None = None

    category_re = re.compile(r"^\s*Category\s*:\s*(.+?)\s*$", re.IGNORECASE)
    name_re = re.compile(r"^\s*(?:\d+[\).]\s*)?ad[ıi]\s*:\s*(.+?)\s*$", re.IGNORECASE)
    amount_re = re.compile(r"^\s*qiym[əe]ti\s*:\s*([0-9]+(?:[.,][0-9]+)?)\s*$", re.IGNORECASE)

    for raw_line in text.splitlines():
        line = repair_mojibake(raw_line)
        if not line or set(line) <= {"-"}:
            continue

        category_match = category_re.match(line)
        if category_match:
            current = {
                "name": repair_mojibake(category_match.group(1)),
                "items": [],
            }
            categories.append(current)
            pending_name = None
            continue

        name_match = name_re.match(line)
        if name_match:
            pending_name = repair_mojibake(name_match.group(1))
            continue

        amount_match = amount_re.match(line)
        if amount_match and pending_name:
            if current is None:
                raise ValueError(f"Item without category: {pending_name}")
            current["items"].append(
                {
                    "name": pending_name,
                    "amount": parse_amount(amount_match.group(1)),
                }
            )
            pending_name = None

    if pending_name:
        raise ValueError(f"Name without price: {pending_name}")

    return categories


def decimal_default(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    raise TypeError(f"{type(value).__name__} is not JSON serializable")


def auth_headers(token: str | None) -> dict[str, str]:
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def get_json(base_url: str, path: str, params: dict[str, Any], token: str | None, timeout: int) -> dict[str, Any]:
    query = urlencode(params)
    url = base_url.rstrip("/") + path + (f"?{query}" if query else "")
    request = Request(url, headers=auth_headers(token), method="GET")

    try:
        with urlopen(request, timeout=timeout) as response:
            response_body = response.read().decode("utf-8")
            if not response_body:
                return {}
            return json.loads(response_body)
    except HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GET {path} failed with {exc.code}: {error_body}") from exc
    except URLError as exc:
        raise RuntimeError(f"GET {path} failed: {exc.reason}") from exc


def post_json(base_url: str, path: str, payload: dict[str, Any], token: str | None, timeout: int) -> dict[str, Any]:
    url = base_url.rstrip("/") + path

    body = json.dumps(payload, ensure_ascii=False, default=decimal_default).encode("utf-8")
    request = Request(url, data=body, headers=auth_headers(token), method="POST")

    try:
        with urlopen(request, timeout=timeout) as response:
            response_body = response.read().decode("utf-8")
            if not response_body:
                return {}
            return json.loads(response_body)
    except HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"POST {path} failed with {exc.code}: {error_body}") from exc
    except URLError as exc:
        raise RuntimeError(f"POST {path} failed: {exc.reason}") from exc


def find_id(response: dict[str, Any]) -> int:
    candidates = [
        response.get("id"),
        response.get("opTypeId"),
        response.get("operationTypeId"),
        response.get("data", {}).get("id") if isinstance(response.get("data"), dict) else None,
        response.get("data", {}).get("opTypeId") if isinstance(response.get("data"), dict) else None,
        response.get("result", {}).get("id") if isinstance(response.get("result"), dict) else None,
    ]
    for candidate in candidates:
        if isinstance(candidate, int):
            return candidate
        if isinstance(candidate, str) and candidate.isdigit():
            return int(candidate)
    raise RuntimeError(f"Could not find created category id in response: {response}")


def find_category_by_name(base_url: str, token: str | None, timeout: int, category_name: str) -> dict[str, Any] | None:
    response = get_json(
        base_url,
        "/api/v1/operation-types/read",
        {"page": 0, "count": 500},
        token,
        timeout,
    )
    for category in response.get("data", []):
        if category.get("categoryName") == category_name:
            return category
    return None


def get_or_create_category(
    base_url: str,
    token: str | None,
    timeout: int,
    category_name: str,
    payload: dict[str, Any],
) -> tuple[int, bool]:
    existing = find_category_by_name(base_url, token, timeout, category_name)
    if existing and existing.get("id") is not None:
        print(f"Using existing category #{existing['id']}: {category_name}")
        return int(existing["id"]), False

    response = post_json(base_url, "/api/v1/operation-types/create", payload, token, timeout)
    try:
        return find_id(response), True
    except RuntimeError:
        created = find_category_by_name(base_url, token, timeout, category_name)
        if created and created.get("id") is not None:
            return int(created["id"]), True
        raise


def existing_item_names(base_url: str, token: str | None, timeout: int, op_type_id: int) -> set[str]:
    response = get_json(
        base_url,
        f"/api/v1/operation-type-items/read/{op_type_id}",
        {"page": 0, "count": 1000},
        token,
        timeout,
    )
    return {item.get("operationName") for item in response.get("data", []) if item.get("operationName")}


def create_all(args: argparse.Namespace, categories: list[dict[str, Any]]) -> None:
    base_url = (args.base_url or os.environ.get("API_BASE_URL") or "http://169.58.138.247").rstrip("/")
    token = args.token or os.environ.get("API_TOKEN") or (get_auth_token(base_url) if not args.dry_run else "")

    for category_index, category in enumerate(categories, start=1):
        category_code = make_code("CAT", category_index, category["name"])
        category_payload = {
            "categoryName": category["name"],
            "categoryCode": category_code,
            "status": args.status,
            "colorSelection": args.color_selection,
            "implantSelection": args.implant_selection,
            "insurances": []
            if not args.insurance_company_id
            else [
                {
                    "deductiblePercentage": args.deductible_percentage,
                    "insuranceCompanyId": args.insurance_company_id,
                }
            ],
        }

        if args.dry_run:
            print(f"\nCATEGORY: {category['name']} ({len(category['items'])} items)")
            print(json.dumps(category_payload, ensure_ascii=False, indent=2, default=decimal_default))
            op_type_id = category_index
        else:
            op_type_id, created = get_or_create_category(base_url, token, args.timeout, category["name"], category_payload)
            if created:
                print(f"Created category #{op_type_id}: {category['name']}")
            existing_names = existing_item_names(base_url, token, args.timeout, op_type_id)

        item_prefix = f"OP{op_type_id}"
        for item_index, item in enumerate(category["items"], start=1):
            item_code = make_code(item_prefix, item_index, item["name"])
            item_payload = {
                "opTypeId": op_type_id,
                "operationName": item["name"],
                "operationCode": item_code,
                "showTechnic": args.show_technic,
                "status": args.status,
                "amount": item["amount"],
                "insurances": []
                if not args.insurance_company_id
                else [
                    {
                        "name": args.insurance_name,
                        "amount": item["amount"],
                        "insuranceCompanyId": args.insurance_company_id,
                        "specificCode": item_code,
                    }
                ],
            }

            if args.dry_run:
                print(json.dumps(item_payload, ensure_ascii=False, indent=2, default=decimal_default))
            else:
                if item["name"] in existing_names:
                    print(f"  Skipped existing item: {item['name']}")
                    continue
                post_json(base_url, "/api/v1/operation-type-items/create", item_payload, token, args.timeout)
                existing_names.add(item["name"])
                print(f"  Created item: {item['name']} ({item['amount']})")
                if args.delay:
                    time.sleep(args.delay)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Import operation type categories and items from pasted text.")
    parser.add_argument("--file", default=DEFAULT_INPUT_FILE, help="Input text file path.")
    parser.add_argument("--base-url", default="http://169.58.138.247", help="API base URL")
    parser.add_argument("--token", help="Bearer token. Can also be set with API_TOKEN.")
    parser.add_argument("--insurance-company-id", type=int, default=0)
    parser.add_argument("--insurance-name", default="Default")
    parser.add_argument("--deductible-percentage", type=float, default=0)
    parser.add_argument("--status", default="ACTIVE")
    parser.add_argument("--color-selection", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--implant-selection", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--show-technic", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--delay", type=float, default=0)
    parser.add_argument("--dry-run", action="store_true", help="Parse and print payloads without sending requests.")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    with open(args.file, "r", encoding="utf-8-sig") as handle:
        text = handle.read()

    categories = parse_input(text)
    if not categories:
        raise SystemExit("No categories found.")

    total_items = sum(len(category["items"]) for category in categories)
    print(f"Parsed {len(categories)} categories and {total_items} items.")
    create_all(args, categories)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
