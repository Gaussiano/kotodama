"""Subsets the Japanese fonts to exactly the glyphs Kotodama uses (spec §15).

Usage:  python scripts/subset-fonts.py <dir-with-source-ttfs>

Source TTFs (SIL Open Font License) come from github.com/google/fonts:
  ofl/kleeone/KleeOne-Regular.ttf
  ofl/shipporiminchob1/ShipporiMinchoB1-Bold.ttf
  ofl/mplusrounded1c/MPLUSRounded1c-Regular.ttf
  ofl/mplusrounded1c/MPLUSRounded1c-Bold.ttf
Requires: pip install fonttools brotli

Outputs src/theme/fonts/*.woff2 (committed) and src/theme/fonts/coverage.json, which a unit test
uses to assert every non-ASCII character in the content is covered. Re-run after adding content.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/theme/fonts"
SRC_DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / ".fonts-src"

FONTS = [
    ("KleeOne-Regular.ttf", "klee-one-400.woff2"),
    ("ShipporiMinchoB1-Bold.ttf", "shippori-mincho-b1-700.woff2"),
    ("MPLUSRounded1c-Regular.ttf", "m-plus-rounded-1c-400.woff2"),
    ("MPLUSRounded1c-Bold.ttf", "m-plus-rounded-1c-700.woff2"),
]

ALWAYS = [
    (0x0020, 0x007E),  # basic latin
    (0x00A0, 0x017F),  # latin-1 + latin ext A (macrons ō ū, ñ, accents)
    (0x2010, 0x2027),  # dashes, quotes, ellipsis
    (0x3000, 0x303F),  # CJK punctuation 、。「」
    (0x3040, 0x309F),  # hiragana
    (0x30A0, 0x30FF),  # katakana
    (0xFF01, 0xFF5E),  # fullwidth forms (＿ ！ ？)
]


def collect_codepoints() -> set[int]:
    cps: set[int] = set()
    for lo, hi in ALWAYS:
        cps.update(range(lo, hi + 1))
    files = list((ROOT / "src").rglob("*.ts")) + list((ROOT / "src").rglob("*.tsx")) + [ROOT / "docs/SPEC.md"]
    for f in files:
        for ch in f.read_text(encoding="utf8"):
            cp = ord(ch)
            if cp > 0x7F:
                cps.add(cp)
    return cps


def main() -> None:
    cps = collect_codepoints()
    OUT.mkdir(parents=True, exist_ok=True)
    unicodes = ",".join(f"U+{cp:04X}" for cp in sorted(cps))
    for src_name, out_name in FONTS:
        src = SRC_DIR / src_name
        if not src.exists():
            sys.exit(f"missing {src}; see docstring")
        subprocess.run(
            [
                sys.executable, "-m", "fontTools.subset", str(src),
                f"--unicodes={unicodes}",
                "--flavor=woff2", "--layout-features=*", "--no-hinting", "--desubroutinize",
                f"--output-file={OUT / out_name}",
            ],
            check=True,
        )
        size = (OUT / out_name).stat().st_size
        print(f"{out_name}: {size / 1024:.0f} KB")
    (OUT / "coverage.json").write_text(json.dumps(sorted(cps)), encoding="utf8")
    print(f"{len(cps)} code points covered")


if __name__ == "__main__":
    main()
