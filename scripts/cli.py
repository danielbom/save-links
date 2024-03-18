import argparse
from dataclasses import dataclass
import json
from pathlib import Path
from typing import List, Optional


@dataclass
class Link:
    url: str
    title: str
    category: Optional[str]
    sub_category: Optional[str]
    favorite: Optional[bool]
    note: Optional[str]

    @classmethod
    def from_json(cls, data: dict):
        return cls(
            url=data["url"],
            title=data["title"],
            category=data.get("category"),
            sub_category=data.get("subCategory"),
            favorite=data.get("favorite"),
            note=data.get("note"),
        )

    def to_json(self):
        result = {}
        result["url"] = self.url
        result["title"] = self.title
        if self.category:
            result["category"] = self.category
        if self.sub_category:
            result["subCategory"] = self.sub_category
        if self.favorite:
            result["favorite"] = self.favorite
        if self.note:
            result["note"] = self.note
        return result


def from_markdown(input_path: str, output_path: str):
    md_path = Path(input_path)
    json_path = Path(output_path)

    with md_path.open(encoding="utf-8") as file:
        lines = file.readlines()

    links = []
    category = None
    sub_category = None

    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith("# "):
            category = line[2:]
            sub_category = None
        elif line.startswith("## "):
            sub_category = line[3:]
        elif line.startswith("- "):
            link = line[2:]
            favorite = False
            note = None
            if link.startswith(":star: "):
                favorite = True
                link = link[7:]
            if not link.startswith("["):
                index = link.find("[")
                note = link[:index].strip()
                link = link[index:]
            index = link.find("](")
            title = link[1:index]
            url = link[index + 2:-1]
            links.append(Link(url=url, title=title, category=category,
                         sub_category=sub_category, favorite=favorite, note=note).to_json())

    with json_path.open("w", encoding="utf-8") as file:
        json.dump(links, file, ensure_ascii=False, indent=2)


def to_markdown(input_path: str, output_path: str):
    def print_link(link: Link):
        favorite = ":star: " if link.favorite else ""
        note = f" {link.note}" if link.note else ""
        title = link.title
        print(f"- {favorite}{note}[{title}]({link.url})", file=file)

    def print_links(links: List[Link]):
        for link in links:
            print_link(link)
        if links:
            print(file=file)

    json_path = Path(input_path)
    md_path = Path(output_path)

    with json_path.open(encoding="utf-8") as file:
        links = json.load(file)

    links = [Link.from_json(link) for link in links]

    groups = {None: {}}
    for link in links:
        if link.category not in groups:
            groups[link.category] = {None: []}
        if link.sub_category not in groups[link.category]:
            groups[link.category][link.sub_category] = []
        groups[link.category][link.sub_category].append(link)

    with md_path.open("w", encoding="utf-8") as file:
        # Without categories
        links = groups.get(None, {})
        links = [link for links in links.values() for link in links]
        del groups[None]

        print_links(links)

        last_category = None
        last_sub_category = None
        categories_keys = sorted(groups.keys())
        for category in categories_keys:
            sub_categories = groups[category]

            if last_category != category:
                print(f"# {category}", file=file)
                print(file=file)
                last_category = category

            links = sub_categories.get(None, [])
            del sub_categories[None]

            print_links(links)

            sub_categories_keys = sorted(sub_categories.keys())
            for sub_category in sub_categories_keys:
                links = sub_categories[sub_category]

                if last_sub_category != sub_category:
                    print(f"## {sub_category}", file=file)
                    print(file=file)
                    last_sub_category = sub_category

                print_links(links)


def sort_links(input_path: str, output_path: str):
    input_path = Path(input_path)
    output_path = Path(output_path)

    with input_path.open(encoding="utf-8") as file:
        links = json.load(file)

    links = [Link.from_json(link) for link in links]
    links.sort(
        key=lambda link: (link.category or "", link.sub_category or "", link.title))

    with output_path.open("w", encoding="utf-8") as file:
        json.dump([link.to_json() for link in links],
                  file, ensure_ascii=False, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Save Links CLI")
    subparsers = parser.add_subparsers(dest="command")

    sb = subparsers.add_parser("from-markdown",
                               help="Generate a JSON file from a markdown file")
    sb.add_argument("input", type=str, help="The input markdown file")
    sb.add_argument("output", type=str, help="The output JSON file")
    sb.set_defaults(func=lambda args: from_markdown(args.input, args.output))

    sb = subparsers.add_parser("to-markdown",
                               help="Generate a markdown file from a JSON file")
    sb.add_argument("input", type=str, help="The input JSON file")
    sb.add_argument("output", type=str, help="The output markdown file")
    sb.set_defaults(func=lambda args: to_markdown(args.input, args.output))

    sb = subparsers.add_parser("sort-links",
                               help="Sort the links in a JSON file")
    sb.add_argument("input", type=str, help="The input JSON file")
    sb.add_argument("output", type=str, help="The output JSON file")
    sb.set_defaults(func=lambda args: sort_links(args.input, args.output))

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return
    args.func(args)


if __name__ == "__main__":
    main()
