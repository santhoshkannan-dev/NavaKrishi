#!/usr/bin/env python3
"""Generate frontend/public/whitepaper.pdf from docs/whitepaper.md

Usage:
  python scripts/generate_whitepaper.py

Requires: reportlab (pip install reportlab)
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import mm
import os


def md_to_paragraphs(md_text):
    lines = md_text.splitlines()
    paras = []
    for line in lines:
        line = line.strip()
        if not line:
            paras.append(('', True))
            continue
        # headings
        if line.startswith('###'):
            paras.append((f"<b>{line[3:].strip()}</b>", False))
        elif line.startswith('##'):
            paras.append((f"<b>{line[2:].strip()}</b>", False))
        elif line.startswith('#'):
            paras.append((f"<b>{line[1:].strip()}</b>", False))
        else:
            # simple list handling
            if line.startswith('- '):
                paras.append((f"• {line[2:].strip()}", False))
            else:
                paras.append((line, False))
    return paras


def generate_pdf(md_path, out_path):
    if not os.path.exists(md_path):
        raise FileNotFoundError(md_path)

    with open(md_path, 'r', encoding='utf-8') as f:
        md = f.read()

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    doc = SimpleDocTemplate(out_path, pagesize=A4, rightMargin=20*mm, leftMargin=20*mm, topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    normal = styles['BodyText']
    normal.spaceAfter = 6
    normal.fontSize = 11
    heading = ParagraphStyle('Heading', parent=styles['Heading2'], spaceAfter=8)

    story = []
    for text, is_blank in md_to_paragraphs(md):
        if is_blank:
            story.append(Spacer(1, 6))
            continue
        if text.startswith('<b>') and text.endswith('</b>'):
            story.append(Paragraph(text[3:-4], heading))
        else:
            story.append(Paragraph(text, normal))

    doc.build(story)


if __name__ == '__main__':
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    md_path = os.path.join(repo_root, 'docs', 'whitepaper.md')
    out_path = os.path.join(repo_root, 'frontend', 'public', 'whitepaper.pdf')
    try:
        generate_pdf(md_path, out_path)
        print(f'Generated {out_path}')
    except Exception as e:
        print('Error:', e)
