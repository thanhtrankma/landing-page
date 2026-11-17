"""Rebuild the self-hosted woff2 files in this folder from the upstream Google Fonts sources.

Usage (needs `pip install fonttools brotli`):
    python build_fonts.py SOURCE.ttf OUT.woff2 SUBSETS [AXES] [rename=OLD:NEW]

SUBSETS  comma-separated: latin, latin-ext, vietnamese (same unicode-ranges Google Fonts uses).
AXES     variable-font axes to pin: "opsz" pins at the default, "wght=600" makes a static 600 instance.
rename   rewrites the internal font names (needed for fonts with an OFL Reserved Font Name).

See README.md for the exact commands used for each file.
"""

import io
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

RANGES = {
    "latin": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,"
    "U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,"
    "U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF",
    "vietnamese": "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,"
    "U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB",
}


def build(src, out, subsets, pin=None, rename=None):
    font = TTFont(src)
    if pin:
        font = instancer.instantiateVariableFont(font, pin)
        buf = io.BytesIO()  # round-trip so the subsetter sees consistent tables
        font.save(buf)
        buf.seek(0)
        font = TTFont(buf)

    opts = subset.Options()
    opts.layout_features = ["*"]  # keep every OpenType feature (tnum, alternates, …)
    opts.hinting = False
    opts.name_IDs = ["*"]
    opts.name_languages = ["*"]
    opts.notdef_outline = True
    opts.flavor = "woff2"
    subsetter = subset.Subsetter(opts)
    subsetter.populate(unicodes=subset.parse_unicodes(",".join(RANGES[s] for s in subsets)))
    subsetter.subset(font)

    if rename:
        old, new = rename
        for rec in font["name"].names:
            if rec.nameID in (0, 7, 13, 14):  # copyright, trademark and licence text stay verbatim
                continue
            rec.string = rec.toUnicode().replace(old, new).replace(old.replace(" ", ""), new.replace(" ", ""))

    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    font.flavor = "woff2"
    font.save(out)
    print(out, os.path.getsize(out))


def main(argv):
    src, out, subsets = argv[1], argv[2], argv[3].split(",")
    pin, rename = None, None
    for arg in argv[4:]:
        if arg.startswith("rename="):
            rename = arg[len("rename="):].split(":")
            continue
        pin = {}
        for axis in arg.split(","):
            tag, _, value = axis.partition("=")
            pin[tag] = float(value) if value else None  # None = pin at the axis default
    build(src, out, subsets, pin, rename)


if __name__ == "__main__":
    main(sys.argv)
