import json
import re

LANG_META = {
    "en": {"name": "English", "native": "English", "script": "Latin", "dir": "ltr"},
    "as": {"name": "Assamese", "native": "অসমীয়া", "script": "Bengali", "dir": "ltr"},
    "bn": {"name": "Bengali", "native": "বাংলা", "script": "Bengali", "dir": "ltr"},
    "brx": {"name": "Bodo", "native": "बर'", "script": "Devanagari", "dir": "ltr"},
    "doi": {"name": "Dogri", "native": "डोगरी", "script": "Devanagari", "dir": "ltr"},
    "gu": {"name": "Gujarati", "native": "ગુજરાતી", "script": "Gujarati", "dir": "ltr"},
    "hi": {"name": "Hindi", "native": "हिन्दी", "script": "Devanagari", "dir": "ltr"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "script": "Kannada", "dir": "ltr"},
    "ks": {"name": "Kashmiri", "native": "کٲشُر", "script": "Perso-Arabic", "dir": "rtl"},
    "kok": {"name": "Konkani", "native": "कोंकणी", "script": "Devanagari", "dir": "ltr"},
    "mai": {"name": "Maithili", "native": "मैथिली", "script": "Devanagari", "dir": "ltr"},
    "ml": {"name": "Malayalam", "native": "മലയാളം", "script": "Malayalam", "dir": "ltr"},
    "mni": {"name": "Manipuri (Meitei)", "native": "ꯃꯤꯇꯩꯂꯣꯟ", "script": "Meetei Mayek", "dir": "ltr"},
    "mr": {"name": "Marathi", "native": "मराठी", "script": "Devanagari", "dir": "ltr"},
    "ne": {"name": "Nepali", "native": "नेपाली", "script": "Devanagari", "dir": "ltr"},
    "or": {"name": "Odia", "native": "ଓଡ଼ିଆ", "script": "Odia", "dir": "ltr"},
    "pa": {"name": "Punjabi", "native": "ਪੰਜਾਬੀ", "script": "Gurmukhi", "dir": "ltr"},
    "sa": {"name": "Sanskrit", "native": "संस्कृतम्", "script": "Devanagari", "dir": "ltr"},
    "sat": {"name": "Santali", "native": "ᱥᱟᱱᱛᱟᱲᱤ", "script": "Ol Chiki", "dir": "ltr"},
    "sd": {"name": "Sindhi", "native": "سنڌي", "script": "Perso-Arabic", "dir": "rtl"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "script": "Tamil", "dir": "ltr"},
    "te": {"name": "Telugu", "native": "తెలుగు", "script": "Telugu", "dir": "ltr"},
    "ur": {"name": "Urdu", "native": "اردو", "script": "Perso-Arabic", "dir": "rtl"}
}

ALL_LANGS = list(LANG_META.keys())

def validate_item(item):
    assert "id" in item, "Missing id"
    assert "journey" in item, f"Missing journey in {item['id']}"
    assert "register" in item, f"Missing register in {item['id']}"
    assert "en" in item, f"Missing en in {item['id']}"
    
    # Check tokens in en
    en_tokens = set(re.findall(r'\{[^{}]+\}', item["en"]))
    for lang in ALL_LANGS:
        if lang not in item:
            raise ValueError(f"Missing language '{lang}' in string ID '{item['id']}'")
        val = item[lang]
        val_tokens = set(re.findall(r'\{[^{}]+\}', val))
        if en_tokens != val_tokens:
            print(f"Warning: token mismatch in {item['id']} for {lang}: EN={en_tokens} vs {lang}={val_tokens}")
