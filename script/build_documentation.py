r"""
MD-Son Master Documentation Builder
Bütün sənəd bölmələrini birləşdirir və PROJECT_DOCUMENTATION.md faylını yaradır.
"""

import os
import sys

if sys.stdout:
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from generate_full_docs import get_header_and_toc
from doc_modules.section_0_5 import get_section_0_to_5
from doc_modules.section_6_modules import get_section_6
from doc_modules.section_7_datamodel import get_section_7
from doc_modules.section_8_api import get_section_8
from doc_modules.section_9_12 import get_section_9_to_12
from doc_modules.section_13_22 import get_section_13_to_22

OUTPUT_PATH = os.path.abspath("PROJECT_DOCUMENTATION.md")

def build():
    print(f"Master sənədin qurulması başlayır: {OUTPUT_PATH}")
    
    sections = [
        get_header_and_toc(),
        get_section_0_to_5(),
        get_section_6(),
        get_section_7(),
        get_section_8(),
        get_section_9_to_12(),
        get_section_13_to_22()
    ]
    
    total_chars = 0
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        for idx, sec in enumerate(sections):
            f.write(sec)
            total_chars += len(sec)
            print(f"Hissə {idx + 1}/{len(sections)} yazıldı ({len(sec)} simvol).")

    print(f"\nUğurla tamamlandı! Ümumi sənəd ölçüsü: {total_chars} simvol.")
    print(f"Fayl ünvanı: {OUTPUT_PATH}")

if __name__ == "__main__":
    build()
