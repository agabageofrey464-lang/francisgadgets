"""Exports the live catalogue to `scripts/catalogue_data.py`.

`dev.db` is gitignored -- correctly, a database does not belong in git -- but
that meant a fresh clone rebuilt only what `seed.py` had inline, which had
fallen far behind the real catalogue (47 products against 160, no ads, and none
of the photo corrections).

Run this after changing the catalogue, then commit `catalogue_data.py`. A clone
on another machine restores the exact same shop with `seed_catalogue.py`.

    python scripts/export_catalogue.py
"""

import pathlib
import sqlite3
import sys

HERE = pathlib.Path(__file__).resolve().parent
DB = HERE.parent / "dev.db"
OUT = HERE / "catalogue_data.py"


def q(value):
    """Repr that survives a round trip and keeps the file readable."""
    if value is None:
        return "None"
    if isinstance(value, (int, float)):
        return repr(value)
    return repr(str(value))


def main() -> None:
    if not DB.exists():
        sys.exit("no dev.db at %s" % DB)

    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row

    categories = con.execute(
        "select name, slug, description from categories order by name"
    ).fetchall()

    products = con.execute(
        """select p.name, p.slug, p.description, p.price, p.compare_at_price, p.sku,
                  p.stock_quantity, p.is_active, c.slug as category_slug
           from products p left join categories c on c.id = p.category_id
           order by p.id"""
    ).fetchall()

    images = {}
    for row in con.execute(
        """select p.slug as pslug, i.url, i.alt_text, i.position
           from product_images i join products p on p.id = i.product_id
           order by p.id, i.position"""
    ):
        images.setdefault(row["pslug"], []).append(
            {"url": row["url"], "alt_text": row["alt_text"], "position": row["position"]}
        )

    ads = con.execute(
        """select advertiser_name, media_url, media_type, link_url, placement,
                  starts_at, ends_at, is_active from ads order by id"""
    ).fetchall()

    lines = [
        '"""The catalogue, generated from a working database.',
        "",
        "Do not edit by hand -- regenerate with `python scripts/export_catalogue.py`",
        "after making changes through the admin dashboard, then commit this file.",
        "",
        "It exists because dev.db is gitignored: without it, cloning the repo onto",
        "another machine rebuilds only a fraction of the shop.",
        '"""',
        "",
        "CATEGORIES = [",
    ]
    for c in categories:
        lines.append(
            "    {'name': %s, 'slug': %s, 'description': %s},"
            % (q(c["name"]), q(c["slug"]), q(c["description"]))
        )
    lines += ["]", "", "PRODUCTS = ["]
    for p in products:
        imgs = images.get(p["slug"], [])
        img_src = ", ".join(
            "{'url': %s, 'alt_text': %s, 'position': %s}"
            % (q(i["url"]), q(i["alt_text"]), i["position"])
            for i in imgs
        )
        lines.append("    {")
        lines.append("        'name': %s," % q(p["name"]))
        lines.append("        'slug': %s," % q(p["slug"]))
        lines.append("        'description': %s," % q(p["description"]))
        lines.append("        'price': %s," % q(p["price"]))
        lines.append("        'compare_at_price': %s," % q(p["compare_at_price"]))
        lines.append("        'sku': %s," % q(p["sku"]))
        lines.append("        'stock_quantity': %s," % p["stock_quantity"])
        lines.append("        'is_active': %s," % bool(p["is_active"]))
        lines.append("        'category_slug': %s," % q(p["category_slug"]))
        lines.append("        'images': [%s]," % img_src)
        lines.append("    },")
    lines += ["]", "", "ADS = ["]
    for a in ads:
        lines.append(
            "    {'advertiser_name': %s, 'media_url': %s, 'media_type': %s, 'link_url': %s,\n"
            "     'placement': %s, 'starts_at': %s, 'ends_at': %s, 'is_active': %s},"
            % (
                q(a["advertiser_name"]), q(a["media_url"]), q(a["media_type"]),
                q(a["link_url"]), q(a["placement"]), q(a["starts_at"]),
                q(a["ends_at"]), bool(a["is_active"]),
            )
        )
    lines += ["]", ""]

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("wrote %s" % OUT.name)
    print("  categories: %d" % len(categories))
    print("  products:   %d" % len(products))
    print("  images:     %d" % sum(len(v) for v in images.values()))
    print("  ads:        %d" % len(ads))


if __name__ == "__main__":
    main()
