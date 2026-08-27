#!/usr/bin/env python3
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent

from gap_builders.gap_ta_te_bn import GAP_TA, GAP_TE, GAP_BN
from gap_builders.gap_as_gu_ml import GAP_AS, GAP_GU, GAP_ML
from gap_builders.gap_or_pa import GAP_OR, GAP_PA
from gap_builders.gap_mni_sat import GAP_MNI, GAP_SAT

ALL_GAPS = {
    "ta": GAP_TA,
    "te": GAP_TE,
    "bn": GAP_BN,
    "as": GAP_AS,
    "gu": GAP_GU,
    "ml": GAP_ML,
    "or": GAP_OR,
    "pa": GAP_PA,
    "mni": GAP_MNI,
    "sat": GAP_SAT,
}

# 1. Verify key parity with COVERAGE.md
cov_text = open(ROOT.parent / "shell-boundaries-fixtures" / "COVERAGE.md", encoding="utf-8").read()
sections = re.split(r"### `([a-z]+)`", cov_text)

cov_keys = {}
for i in range(1, len(sections), 2):
    lang = sections[i]
    sec_content = sections[i+1]
    keys = re.findall(r"- `([^`]+)`", sec_content)
    cov_keys[lang] = keys

print("=== VERIFYING KEY PARITY ===")
all_pass = True
for lang, gap_dict in ALL_GAPS.items():
    expected = cov_keys[lang]
    actual_keys = list(gap_dict.keys())
    missing = set(expected) - set(actual_keys)
    extra = set(actual_keys) - set(expected)
    if missing or extra:
        print(f"FAILED {lang}: missing={len(missing)}, extra={len(extra)}")
        all_pass = False
    else:
        print(f"PASSED {lang}: exactly {len(actual_keys)} keys matching COVERAGE.md")

if not all_pass:
    print("Aborting due to key parity errors.")
    exit(1)

# 2. Write per-language JSON fragments in multilingual-packs/gap_fragments/<lang>.json
frag_dir = ROOT / "gap_fragments"
frag_dir.mkdir(exist_ok=True)
for lang, gap_dict in ALL_GAPS.items():
    frag_file = frag_dir / f"{lang}.json"
    frag_file.write_text(json.dumps(gap_dict, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {frag_file}")

# 3. Update multilingual-packs/data/gap_translations.py
# Load existing G
import sys
sys.path.insert(0, str(ROOT))
from data.gap_translations import G

# Merge all into G
for lang, gap_dict in ALL_GAPS.items():
    for k, val in gap_dict.items():
        if k not in G:
            G[k] = {}
        G[k][lang] = val

# Write updated G back to data/gap_translations.py
gap_py_lines = [
    "# Remaining shell keys (not in the 208-part catalog) → real translations.",
    "# Updated with complete Packet A gap-fill for all 10 languages.",
    "",
    "G = {"
]
for k in sorted(G.keys()):
    translations = G[k]
    encoded_entries = []
    for l_code, text in sorted(translations.items()):
        escaped_text = json.dumps(text, ensure_ascii=False)
        encoded_entries.append(f'"{l_code}": {escaped_text}')
    gap_py_lines.append(f'  "{k}": {{')
    # Format 4 entries per line for readability
    chunk_size = 3
    for i in range(0, len(encoded_entries), chunk_size):
        chunk = encoded_entries[i:i+chunk_size]
        trailing = "," if i + chunk_size < len(encoded_entries) else ""
        gap_py_lines.append("    " + ", ".join(chunk) + trailing)
    gap_py_lines.append("  },")

gap_py_lines.append("}")
gap_py_path = ROOT / "data" / "gap_translations.py"
gap_py_path.write_text("\n".join(gap_py_lines) + "\n", encoding="utf-8")
print(f"Updated {gap_py_path} with {len(G)} keys.")

