"""Convert the article portion of an editorial DOCX to the CMS rich-document JSON format.

Editorial metadata before the first Heading 1 is intentionally excluded. Word tables are converted
to accessible heading/list blocks because the current TipTap configuration has no table extension.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS = {"w": W, "r": R}


def style_of(paragraph: ET.Element) -> str:
    style = paragraph.find("./w:pPr/w:pStyle", NS)
    return style.attrib.get(f"{{{W}}}val", "") if style is not None else ""


def paragraph_text(paragraph: ET.Element) -> str:
    return "".join(item.text or "" for item in paragraph.findall(".//w:t", NS)).strip()


def inline_content(paragraph: ET.Element, relationships: dict[str, str]) -> list[dict]:
    output: list[dict] = []
    for child in paragraph:
        link = child.tag == f"{{{W}}}hyperlink"
        target = relationships.get(child.attrib.get(f"{{{R}}}id", "")) if link else None
        runs = child.findall(".//w:r", NS) if link else ([child] if child.tag == f"{{{W}}}r" else [])
        for run in runs:
            text = "".join(item.text or "" for item in run.findall(".//w:t", NS))
            if not text:
                continue
            marks: list[dict] = []
            if run.find("./w:rPr/w:b", NS) is not None:
                marks.append({"type": "bold"})
            if run.find("./w:rPr/w:i", NS) is not None:
                marks.append({"type": "italic"})
            if target:
                marks.append({"type": "link", "attrs": {"href": target}})
            node: dict = {"type": "text", "text": text}
            if marks:
                node["marks"] = marks
            output.append(node)
    return output or [{"type": "text", "text": paragraph_text(paragraph)}]


def table_rows(table: ET.Element) -> list[list[str]]:
    return [[paragraph_text(cell) for cell in row.findall("./w:tc", NS)] for row in table.findall("./w:tr", NS)]


def table_blocks(table: ET.Element) -> list[dict]:
    rows = table_rows(table)
    if len(rows) < 2:
        return []
    headers = rows[0]
    blocks: list[dict] = []
    for number, row in enumerate(rows[1:], 1):
        primary = row[0].strip() if row else f"Item {number}"
        blocks.append({"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": primary}]})
        items = []
        for index, value in enumerate(row[1:], 1):
            if not value.strip():
                continue
            label = headers[index].strip() if index < len(headers) else f"Detail {index}"
            items.append({"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": f"{label}: {value.strip()}"}]}]})
        if items:
            blocks.append({"type": "bulletList", "content": items})
    return blocks


def main() -> None:
    source = Path(sys.argv[1]).resolve()
    with ZipFile(source) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
        rel_root = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
        relationships = {item.attrib["Id"]: item.attrib.get("Target", "") for item in rel_root}

    body = root.find("w:body", NS)
    if body is None:
        raise RuntimeError("DOCX has no document body")
    started = False
    nodes: list[dict] = []
    pending_list: dict | None = None
    editorial_end_headings = {
        "پیشنهادهای لینک‌سازی داخلی",
        "پیشنهادهای لینک سازی داخلی",
        "یادداشت تحقیق کلمه کلیدی",
    }

    def flush_list() -> None:
        nonlocal pending_list
        if pending_list:
            nodes.append(pending_list)
            pending_list = None

    for child in body:
        if child.tag == f"{{{W}}}p":
            text = paragraph_text(child)
            style = style_of(child)
            if not started:
                if style == "Heading1":
                    started = True
                continue
            if style == "Heading2" and text in editorial_end_headings:
                flush_list()
                break
            if not text:
                continue
            if style.startswith("Heading"):
                flush_list()
                level = max(2, min(4, int(style.removeprefix("Heading") or "2")))
                nodes.append({"type": "heading", "attrs": {"level": level}, "content": inline_content(child, relationships)})
            elif style in {"ListBullet", "ListNumber"}:
                kind = "bulletList" if style == "ListBullet" else "orderedList"
                if not pending_list or pending_list["type"] != kind:
                    flush_list()
                    pending_list = {"type": kind, "content": []}
                pending_list["content"].append({"type": "listItem", "content": [{"type": "paragraph", "content": inline_content(child, relationships)}]})
            else:
                flush_list()
                nodes.append({"type": "paragraph", "content": inline_content(child, relationships)})
        elif child.tag == f"{{{W}}}tbl" and started:
            flush_list()
            nodes.extend(table_blocks(child))
    flush_list()
    print(json.dumps({"type": "doc", "content": nodes}, ensure_ascii=False))


if __name__ == "__main__":
    main()
