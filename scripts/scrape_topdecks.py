import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Dict, Any
from urllib.request import urlopen

FEED_URL = "https://www.hearthstonetopdecks.com/decks/feed/"
PAGES = [1, 2, 3]

CLASS_COLORS = {
    "Death Knight": "#6e7680",
    "Demon Hunter": "#5e8b7e",
    "Druid": "#c98f44",
    "Hunter": "#9dc41a",
    "Mage": "#4aa3ff",
    "Paladin": "#f2c94c",
    "Priest": "#d6dde7",
    "Rogue": "#b48c73",
    "Shaman": "#0090be",
    "Warlock": "#7b2c8c",
    "Warrior": "#c24c3e",
}


def fetch(url: str) -> str:
    with urlopen(url) as resp:
        return resp.read().decode("utf-8")


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def parse_deck_page(url: str) -> Dict[str, Any]:
    html = fetch(url)
    # Deck info block
    deck_meta_match = re.search(r'<div class="deck-meta">(.*?)</div>', html, re.S)
    deck_meta_html = deck_meta_match.group(1) if deck_meta_match else ""
    deck_info_match = re.search(r'<div class="deck-info">(.*?)</div>', html, re.S)
    deck_info_html = deck_info_match.group(1) if deck_info_match else ""

    def extract(label: str, html_block: str) -> str:
        pattern = rf"{label}:</strong>\s*(?:<a[^>]*>)?([^<]+)"
        match = re.search(pattern, html_block)
        if match:
            return clean_text(match.group(1))
        return ""

    class_name = extract("Class", deck_meta_html)
    deck_format = extract("Format", deck_meta_html)
    archetype = extract("Type", deck_meta_html)
    style = extract("Style", deck_meta_html)
    season = extract("Season", deck_meta_html)

    dust_match = re.search(r"Dust Cost:</strong>\s*([0-9,]+)", deck_info_html)
    dust_cost = int(dust_match.group(1).replace(",", "")) if dust_match else None

    # Grab hero image if available
    thumb_match = re.search(r'<img class="deck-card-thumbnail" src="([^"]+)"', html)
    thumbnail = thumb_match.group(1) if thumb_match else None

    # Card count summary
    total_cards_match = re.search(r'<strong>([A-Z\s]+) \((\d+)\)</strong>', html)
    total_cards = int(total_cards_match.group(2)) if total_cards_match else None

    return {
        "class": class_name,
        "format": deck_format,
        "archetype": archetype,
        "style": style,
        "season": season,
        "dustCost": dust_cost,
        "thumbnail": thumbnail,
        "totalCards": total_cards,
    }


def main() -> None:
    decks = []
    seen_links = set()
    for page in PAGES:
        feed_url = FEED_URL if page == 1 else f"{FEED_URL}?paged={page}"
        xml_text = fetch(feed_url)
        items = re.findall(r"<item>(.*?)</item>", xml_text, re.S)
        for item_html in items:
            title_match = re.search(r"<title>(.*?)</title>", item_html)
            link_match = re.search(r"<link>(.*?)</link>", item_html)
            author_match = re.search(r"<dc:creator><!\[CDATA\[(.*?)\]\]></dc:creator>", item_html)
            date_match = re.search(r"<pubDate>(.*?)</pubDate>", item_html)

            link = clean_text(link_match.group(1)) if link_match else None
            if not link or link in seen_links:
                continue
            seen_links.add(link)

            deck_details = {
                "title": clean_text(title_match.group(1)) if title_match else "",
                "slug": link.rstrip("/").split("/")[-1],
                "link": link,
                "author": clean_text(author_match.group(1)) if author_match else "",
                "published": clean_text(date_match.group(1)) if date_match else "",
            }
            deck_details.update(parse_deck_page(link))
            decks.append(deck_details)

    # Build summaries
    total = len(decks)
    class_counter = Counter(deck["class"] or "Unknown" for deck in decks)
    format_counter = Counter(deck["format"] or "Unknown" for deck in decks)
    archetype_counter = Counter(deck["archetype"] or "Unknown" for deck in decks)

    def summary(counter):
        summary_list = []
        for label, count in counter.most_common():
            percent = round((count / total) * 100, 2) if total else 0
            summary_list.append({
                "label": label,
                "count": count,
                "percent": percent,
                "color": CLASS_COLORS.get(label),
            })
        return summary_list

    data = {
        "scrapedAt": datetime.now(timezone.utc).isoformat(),
        "source": "https://www.hearthstonetopdecks.com/decks/",
        "totalDecks": total,
        "classSummary": summary(class_counter),
        "formatSummary": summary(format_counter),
        "archetypeSummary": summary(archetype_counter),
        "decks": decks,
    }

    json.dump(data, sys.stdout, indent=2)


if __name__ == "__main__":
    main()
