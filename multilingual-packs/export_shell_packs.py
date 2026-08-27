#!/usr/bin/env python3
"""Re-export nested strings.<lang>.json from the master catalog + gap translations.
Canonical key tree: shell-boundaries-fixtures/data/strings.en.json
"""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
import unicodedata
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SHELL = ROOT.parent / "shell-boundaries-fixtures"
OUT = ROOT / "i18n"
SHELL_I18N = SHELL / "data" / "i18n"

sys.path.insert(0, str(ROOT))
os.chdir(ROOT)

from generator_base import LANG_META, ALL_LANGS  # noqa: E402
from data.gap_translations import G  # noqa: E402
from data.part1_shell_ack import STRINGS_PART1  # noqa: E402
from data.part2_checklist_login import STRINGS_PART2  # noqa: E402
from data.part3_track_journey import STRINGS_PART3  # noqa: E402
from data.part4_file_named import STRINGS_PART4  # noqa: E402
from data.part5_ackslip_scripts_procmap import STRINGS_PART5  # noqa: E402
from data.part6_spine_moneymap_flags import STRINGS_PART6  # noqa: E402
from data.part7_machine_codes_events import STRINGS_PART7  # noqa: E402
from data.part8_fir_recovery import STRINGS_PART8  # noqa: E402
from data.part9_file_anonymous import STRINGS_PART9  # noqa: E402
from data.part10_scenarios_validation_system import STRINGS_PART10  # noqa: E402
from data.part11_expanded_suite import STRINGS_PART11  # noqa: E402
from data.part12_detail_strings import STRINGS_PART12  # noqa: E402
from data.part13_journey_rails_steps import STRINGS_PART13  # noqa: E402
from data.part14_journey_extras import STRINGS_PART14  # noqa: E402

PARTS = (
    STRINGS_PART1 + STRINGS_PART2 + STRINGS_PART3 + STRINGS_PART4
    + STRINGS_PART5 + STRINGS_PART6 + STRINGS_PART7 + STRINGS_PART8
    + STRINGS_PART9 + STRINGS_PART10 + STRINGS_PART11 + STRINGS_PART12
    + STRINGS_PART13 + STRINGS_PART14
)

FAMILY = {
    "brx": "hi", "doi": "hi", "kok": "hi", "mai": "hi", "ne": "hi", "sa": "hi",
    "sd": "ur", "ks": "ur", "as": "bn",
}

PROTECTED = {
    "chrome.fontSmall", "chrome.fontNormal", "chrome.fontLarge",
    "chrome.i4cShort", "home.helplineNum", "chrome.langEn", "chrome.langHi",
    "chrome.langBn", "chrome.langTa", "chrome.langTe", "chrome.langMr",
    "chrome.langMore", "chrome.govIndia", "chrome.mha", "otpToast.from",
    "complaint.hh", "complaint.mm", "complaint.ampm",
    "status.elapsed", "status.age", "status.deadline", "status.target",
    "anonForm.catRgr", "anonForm.catObscene", "anonForm.catExplicit", "anonForm.catCseam",
}

SCRIPT_RANGES = {
    "Latin": [(0x0041, 0x024F)],
    "Devanagari": [(0x0900, 0x097F)],
    "Bengali": [(0x0980, 0x09FF)],
    "Gujarati": [(0x0A80, 0x0AFF)],
    "Gurmukhi": [(0x0A00, 0x0A7F)],
    "Kannada": [(0x0C80, 0x0CFF)],
    "Malayalam": [(0x0D00, 0x0D7F)],
    "Meetei Mayek": [(0xABC0, 0xABFF), (0xAAE0, 0xAAFF)],
    "Odia": [(0x0B00, 0x0B7F)],
    "Ol Chiki": [(0x1C50, 0x1C7F)],
    "Perso-Arabic": [(0x0600, 0x06FF), (0x0750, 0x077F), (0x08A0, 0x08FF), (0xFB50, 0xFDFF), (0xFE70, 0xFEFF)],
    "Tamil": [(0x0B80, 0x0BFF)],
    "Telugu": [(0x0C00, 0x0C7F)],
}


def flatten(d, prefix=""):
    items = {}
    for k, v in d.items():
        if str(k).startswith("$"):
            continue
        ck = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.update(flatten(v, ck))
        else:
            items[ck] = v
    return items


def unflatten(flat):
    root = {}
    for path, val in flat.items():
        cur = root
        parts = path.split(".")
        for p in parts[:-1]:
            cur = cur.setdefault(p, {})
        cur[parts[-1]] = val
    return root


def in_script(ch, ranges):
    o = ord(ch)
    return any(a <= o <= b for a, b in ranges)


def script_ratio(text, script):
    ranges = SCRIPT_RANGES.get(script)
    if not ranges:
        return 1.0
    letters = [c for c in text if unicodedata.category(c).startswith("L")]
    if not letters:
        return 1.0
    own = sum(1 for c in letters if in_script(c, ranges))
    return own / len(letters)


def is_protected_value(val: str) -> bool:
    if not isinstance(val, str):
        return True
    s = val.strip()
    if not s:
        return True
    if s in {"I4C", "1930", "A−", "A", "A+", "+16", "OTP", "HH", "MM", "AM/PM",
             "ELAPSED", "AGE", "DEADLINE", "TARGET", "XXNCRP",
             "GOVERNMENT OF INDIA", "MINISTRY OF HOME AFFAIRS", "English"}:
        return True
    if re.fullmatch(r"[\d₹×·\s\-\+\.,/]+", s):
        return True
    return False


def is_already_non_english(val: str) -> bool:
    """Companion *Hi keys (and any en-tree value already in Indic/Arabic script)
    are not English source text — exclude from the 95% English-clone test."""
    if not isinstance(val, str):
        return False
    letters = [c for c in val if unicodedata.category(c).startswith("L")]
    if not letters:
        return False
    latin = sum(1 for c in letters if "LATIN" in unicodedata.name(c, ""))
    return latin / len(letters) < 0.5


def load_parts_index():
    by_en = {}
    by_id = {}
    for item in PARTS:
        by_id[item["id"]] = item
        by_en.setdefault(item["en"].strip().lower(), []).append(item)
    return by_id, by_en


def lookup(key, en_val, lang, by_id, by_en):
    if lang == "en":
        return en_val, "en"
    if key in PROTECTED or is_protected_value(en_val):
        return en_val, "protected"
    if key.endswith("Hi"):
        return en_val, "hi-companion"

    if key in G and lang in G[key] and G[key][lang] and G[key][lang] != en_val:
        return G[key][lang], "gap"

    # family copy of gap
    src = FAMILY.get(lang)
    if src and key in G and src in G[key] and G[key][src] != en_val:
        return G[key][src], "family"

    item = by_id.get(key)
    if item and item.get(lang) and item[lang] != item.get("en"):
        return item[lang], "id"

    hits = by_en.get((en_val or "").strip().lower(), [])
    if hits:
        h = hits[0]
        if h.get(lang) and h[lang] != h["en"]:
            return h[lang], "en-match"
        if src and h.get(src) and h[src] != h["en"]:
            return h[src], "family-en"

    # master catalog (may still be English clones — only use if different)
    return None, "missing"


def main():
    en_tree = json.loads((SHELL / "data" / "strings.en.json").read_text(encoding="utf-8"))
    flat_en = flatten(en_tree)
    by_id, by_en = load_parts_index()
    master = json.loads((OUT / "strings.json").read_text(encoding="utf-8"))
    master_by_id = {s["id"]: s for s in master["strings"]}

    codes = json.loads((SHELL / "data" / "codes.json").read_text(encoding="utf-8"))
    (OUT / "codes.json").write_text(json.dumps(codes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    coverage_rows = []
    fallbacks = {}  # lang -> [keys]
    lang_flats = {}

    regional = [l for l in ALL_LANGS if l != "en"]

    for lang in ALL_LANGS:
        flat = {}
        fb = []
        differ = same = prot = 0
        missing = []
        for key, en_val in flat_en.items():
            if lang == "en":
                flat[key] = en_val
                continue
            val, how = lookup(key, en_val, lang, by_id, by_en)
            if val is None:
                # try master if actually translated
                m = master_by_id.get(key)
                if m and m.get(lang) and m[lang] != m.get("en", en_val):
                    val, how = m[lang], "master"
            if val is None:
                hi_val, _ = lookup(key, en_val, "hi", by_id, by_en)
                if hi_val and hi_val != en_val:
                    val = hi_val
                    how = "hi-fallback"
                    fb.append(key)
                else:
                    val = en_val
                    how = "english-clone"
                    missing.append(key)
                    fb.append(key)
            # Stand-in Hindi inside a non-Devanagari pack is a visible fallback.
            script = LANG_META[lang]["script"]
            if (
                lang not in ("en", "hi")
                and script not in ("Devanagari", "Latin")
                and not key.endswith("Hi")
                and not is_already_non_english(en_val)
                and val
                and script_ratio(str(val), script) < 0.4
                and script_ratio(str(val), "Devanagari") >= 0.4
                and key not in fb
            ):
                fb.append(key)
            flat[key] = val
            if key in PROTECTED or is_protected_value(en_val) or is_already_non_english(en_val):
                prot += 1
            elif val == en_val:
                same += 1
            else:
                differ += 1
        lang_flats[lang] = flat
        fallbacks[lang] = fb
        translatable = differ + same
        pct = (100.0 * differ / translatable) if translatable else 0.0
        script = LANG_META[lang]["script"]
        blob = " ".join(
            str(v) for k, v in flat.items()
            if k not in PROTECTED and not is_protected_value(flat_en[k]) and not is_already_non_english(flat_en[k])
        )
        ratio = 1.0 if lang == "en" else script_ratio(blob, script)
        coverage_rows.append({
            "lang": lang,
            "name": LANG_META[lang]["name"],
            "native": LANG_META[lang]["native"],
            "script": script,
            "dir": LANG_META[lang]["dir"],
            "keys": len(flat),
            "differ": differ,
            "same": same,
            "protected": prot,
            "pct": pct,
            "script_ratio": ratio,
            "fallback_n": len(fb),
            "pass_a": len(flat) == len(flat_en),
            "pass_b": lang == "en" or pct >= 95.0,
            "pass_c": lang == "en" or script == "Latin" or ratio >= 0.55,
        })

        tree = unflatten(flat)
        tree["$meta"] = {
            "locale": lang,
            "packet": "B",
            "native": LANG_META[lang]["native"],
            "script": LANG_META[lang]["script"],
            "dir": LANG_META[lang]["dir"],
        }
        OUT.mkdir(exist_ok=True)
        (OUT / f"strings.{lang}.json").write_text(
            json.dumps(tree, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    # Rebuild master strings.json from the new trees so it is no longer an English clone.
    master_items = []
    for key in sorted(flat_en):
        item = {"id": key, "en": flat_en[key], "journey": key.split(".")[0], "register": "shell"}
        for lang in regional:
            item[lang] = lang_flats[lang][key]
        master_items.append(item)
    master_out = {
        "$meta": {
            "version": "i18n-v2-reexport",
            "description": "Nested-key-aligned 22 Eighth-Schedule packs for the NCRP shell",
            "totalStrings": len(master_items),
            "fallbackRule": "Missing or English-clone key → Hindi with .i18n-fallback dotted underline. Never silent English-only.",
            "languages": LANG_META,
            "eighthScheduleLangs": regional,
        },
        "codes": codes.get("codes", []),
        "strings": master_items,
    }
    (OUT / "strings.json").write_text(json.dumps(master_out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Sidecar fallbacks
    (OUT / "fallbacks.json").write_text(json.dumps(fallbacks, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Copy into the shell so either serve root works
    SHELL_I18N.mkdir(parents=True, exist_ok=True)
    for p in OUT.glob("strings.*.json"):
        shutil.copy2(p, SHELL_I18N / p.name)
    shutil.copy2(OUT / "codes.json", SHELL_I18N / "codes.json")
    shutil.copy2(OUT / "fallbacks.json", SHELL_I18N / "fallbacks.json")
    shutil.copy2(SHELL / "data" / "strings.en.json", SHELL_I18N / "strings.en.json")

    # Coverage markdown
    lines = [
        "# Pack re-export coverage",
        "",
        "Canonical tree: `shell-boundaries-fixtures/data/strings.en.json` (351 keys).",
        "Source: `i18n/strings.json` parts + `data/gap_translations.py`.",
        "Protected tokens/codes excluded from the 95% test.",
        "",
        "| Lang | Native | Keys | Differ% | Script ratio | (a) parity | (b) ≥95% | (c) script | Fallbacks |",
        "|---|---|---:|---:|---:|---|---|---|---:|",
    ]
    failing = []
    for r in coverage_rows:
        if r["lang"] == "en":
            continue
        a = "PASS" if r["pass_a"] else "FAIL"
        b = "PASS" if r["pass_b"] else "FAIL"
        c = "PASS" if r["pass_c"] else "FAIL"
        lines.append(
            f"| `{r['lang']}` | {r['native']} | {r['keys']} | {r['pct']:.1f}% | {r['script_ratio']:.2f} | {a} | {b} | {c} | {r['fallback_n']} |"
        )
        if not r["pass_b"] or not r["pass_c"]:
            failing.append(r)

    lines += ["", "## Languages below 95% or script-ratio — untranslated keys (Hindi fallback)"]
    if not failing:
        lines.append("None.")
    for r in failing:
        keys = fallbacks.get(r["lang"], [])
        lines.append(f"")
        lines.append(f"### `{r['lang']}` {r['native']} — {len(keys)} keys")
        for k in keys:
            lines.append(f"- `{k}`")

    cov_path = ROOT / "COVERAGE.md"
    cov_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    shutil.copy2(cov_path, SHELL / "COVERAGE.md")

    print(cov_path.read_text(encoding="utf-8")[:4000])
    print("\nWrote", OUT, "and", SHELL_I18N)


if __name__ == "__main__":
    main()
