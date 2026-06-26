"""Quy cách đóng hàng: cân nặng + kích thước theo loại hộp (nguồn: data/pack-dimension-rules.json)."""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

RULES_PATH = Path(__file__).resolve().parents[1] / "data" / "pack-dimension-rules.json"


def _load() -> dict:
    return json.loads(RULES_PATH.read_text(encoding="utf-8"))


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", str(s).lower())
    s = re.sub(
        r"[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]",
        " ",
        s,
    )
    return re.sub(r"\s+", " ", s).strip()


def classify_pack_type(label: str) -> str | None:
    """Phân loại hộp từ tên thư mục / tên SP / id."""
    t = norm(label.replace("/", " "))
    if re.search(r"\bkhay\b", t):
        return "6_banh_mini"
    if re.search(r"2 bánh ép kim|2 banh ep kim|ép nhũ|ep nhu", t):
        return "2_banh_dat"
    if re.search(r"2 bánh rẻ|2 banh re", t):
        return "2_banh_re"
    if re.search(r"bát giác|bat giac", t):
        return "bat_giac"
    if re.search(r"6 bánh mini|6 banh mini|6 mini", t):
        return "6_banh_mini"
    if re.search(r"4 bánh rẻ|4 banh re|4b re", t):
        return "4_banh_re"
    if re.search(
        r"4 bánh trà.*6|6 bánh.*trà|trà.*6 bánh|kem hộp tra.*6|kem hop tra.*6|"
        r"liên nguyệt.*6|lien nguyet.*6|hoàng kim.*6|hoang kim.*6|hạc vũ|hac vu|"
        r"gấp gọn|gap gon|nguyệt liên|nguyet lien|song ngư|song ngu",
        t,
    ):
        return "4_banh_tra_6_banh"
    if re.search(r"6 bánh|6 banh", t):
        return "4_banh_tra_6_banh"
    if re.search(r"4 bánh|4 banh", t):
        return "4_banh_co_nap"
    if re.search(r"hộp cứng|hop cung", t) and re.search(r"trà|tra", t):
        return "4_banh_tra_6_banh"
    if re.search(r"hạc vân|hac van|hộp cứng|hop cung", t):
        return "4_banh_co_nap"
    return None


def pack_size_text(pack_type: str | None) -> str:
    if not pack_type:
        return ""
    data = _load()
    row = data.get("types", {}).get(pack_type)
    return row.get("sizeText", "") if row else ""


def pack_size_label(pack_type: str | None) -> str:
    if not pack_type:
        return ""
    data = _load()
    row = data.get("types", {}).get(pack_type)
    return row.get("label", "") if row else ""


def dimension_bullet(pack_type: str | None) -> str:
    text = pack_size_text(pack_type)
    return f"•Kích thước: {text}" if text else ""


def packing_weight(label: str) -> tuple[int | None, str]:
    """Cân đóng hàng (g) + nhãn loại."""
    data = _load()
    w = data.get("weightRules", {})
    t = norm(label.replace("/", " "))
    if re.search(r"2 bánh ép kim|ép nhũ", t):
        return w.get("2_banh_ep_kim", 50), "2 bánh ép kim"
    if re.search(r"2 bánh rẻ", t):
        return w.get("2_banh_re", 20), "2 bánh rẻ"
    if re.search(r"1 bánh to|300g|600g|bánh to", t):
        return w.get("1_banh_to", 180), "1 bánh to"
    if re.search(r"1 bánh|1b mini|cho bé", t) and "to" not in t:
        return w.get("1_banh", 50), "1 bánh"
    if re.search(r"4 bánh rẻ|4b rẻ", t):
        return w.get("4_banh_re", 250), "4 bánh rẻ"
    if re.search(r"6 bánh mini|6 mini", t):
        return w.get("6_banh_mini", 300), "6 bánh mini"
    if re.search(r"6 bánh", t):
        return w.get("4_banh", 330), "6 bánh"
    if re.search(r"4 bánh", t):
        return w.get("4_banh", 330), "4 bánh"
    if re.search(r"hạc vân|hộp cứng", t):
        return w.get("4_banh", 330), "4 bánh"
    return None, ""


def upsert_spec_bullets(bullets: list[str], pack_type: str | None, weight_g: int | None, weight_type: str) -> list[str]:
    """Thay bullet cân nặng / kích thước / KT bằng giá trị chuẩn."""
    other = [
        b
        for b in bullets
        if not re.search(r"cân nặng|kích thước|^•\s*kt\b", b, re.I)
    ]
    out: list[str] = []
    if weight_g and weight_type:
        out.append(f"•Cân nặng đóng hàng: {weight_g}g ({weight_type})")
    dim = dimension_bullet(pack_type)
    if dim:
        out.append(dim)
    return out + other
