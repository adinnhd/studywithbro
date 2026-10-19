"""Regenerate question text, solutions and vector diagrams from the repository PDFs.

Requires Python 3 + PyMuPDF (only for regeneration; not an app dependency).
Run from the repository root. Never exports full PDF pages to public/.
"""

import json
import re
from shutil import copyfile
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'reference/katrol/paket-a/pdf'
quiz = pymupdf.open(SOURCE / 'Studywithbro_Latihan_Katrol.pdf')
full = pymupdf.open(SOURCE / 'Studywithbro_Katrol_Pembahasan.pdf')
assert all(quiz[i].get_text() == full[i].get_text() for i in range(11)), \
    'Question pages differ between the source PDFs; inspect them before regenerating.'

# Zero-based PDF page and exact bounds of the diagram panel (PDF points).
diagrams = {
    3: (2, (55, 135, 540, 312), 'Gambar 1'),
    5: (3, (55, 135, 540, 292), 'Gambar 2'),
    9: (4, (55, 372, 540, 549), 'Gambar 3'),
    12: (6, (55, 166, 540, 323), 'Gambar 4'),
    15: (7, (55, 332, 540, 509), 'Gambar 5'),
    18: (8, (55, 513, 540, 670), 'Gambar 6'),
    20: (9, (55, 347, 540, 524), 'Ilustrasi katrol'),
}
combinations = {
    15: [[1, 2, 3], [2, 3, 4], [1, 4, 5], [1, 2, 4], [2, 4, 5]],
    18: [[1, 3, 4], [2, 3, 4], [2, 4, 5], [1, 2, 3], [3, 4, 5]],
    20: [[2, 3, 4], [1, 2, 3], [1, 3, 5], [2, 4, 5], [1, 2, 5]],
}
letters = 'ABCDE'
questions = []
for page_index in range(1, 10):
    blocks = sorted(quiz[page_index].get_text('blocks'), key=lambda b: (b[1], b[0]))
    headers = [b for b in blocks if re.match(r'^\d{2}\n', b[4])]
    for header in headers:
        number = int(header[4][:2])
        stop = min([b[1] for b in headers if b[1] > header[1]] + [800])
        body = [b for b in blocks if header[3] < b[1] < stop]
        options = []
        for b in body:
            match = re.match(r'^(?:□ )?([A-E])\.\n(.+)', b[4], re.S)
            if match:
                options.append({'id': match[1], 'text': ' '.join(match[2].split())})
        first_option = min(b[1] for b in body if re.match(r'^(?:□ )?[A-E]\.\n', b[4]))
        text_end = diagrams[number][1][1] if number in diagrams else first_option
        text = ' '.join(' '.join(b[4].split()) for b in body if b[1] < text_end)
        item = {'id': number, 'text': text, 'options': options}
        if number in combinations:
            item['text'] = text.replace('Pilih SEMUA pernyataan yang benar.',
                                        'Kombinasi pernyataan yang benar adalah ...')
            item['statements'] = [o['text'] for o in options]
            item['options'] = [{'id': letter, 'text': ', '.join(f'({n})' for n in nums)}
                               for letter, nums in zip(letters, combinations[number])]
        if number in diagrams:
            item['image'] = f'/latihan/katrol/soal-{number:02}.svg'
            item['imageLabel'] = diagrams[number][2]
        assert len(item['options']) == 5, number
        questions.append(item)

# Read source explanations and source answer headers, omitting categories.
solutions = []
source_keys = []
for page in list(full)[11:13]:
    blocks = sorted(page.get_text('blocks'), key=lambda b: (b[1], b[0]))
    headers = [b for b in blocks if re.match(r'^\d{2} • ', b[4])]
    for header in headers:
        match = re.match(r'^(\d{2}) • ([A-E](?:, [A-E])*) ', header[4])
        number, key = int(match[1]), match[2]
        source_keys.append(key)
        stop = min([b[1] for b in headers if b[1] > header[1]] + [800])
        explanation = ' '.join(header[4].splitlines()[1:])
        following = ' '.join(' '.join(b[4].split()) for b in blocks
                             if header[3] < b[1] < stop)
        explanation = ' '.join(part for part in [explanation, following] if part)
        if number in combinations:
            nums = [letters.index(letter) + 1 for letter in key.split(', ')]
            answer = letters[combinations[number].index(nums)]
            for letter, n in zip(letters, range(1, 6)):
                explanation = explanation.replace(f'({letter} benar)', f'(pernyataan {n} benar)')
                explanation = explanation.replace(f'({letter} salah)', f'(pernyataan {n} salah)')
                explanation = explanation.replace(f'({letter})', f'(pernyataan {n})')
            explanation = explanation.replace('Jadi B, C, D.',
                                               'Jadi pernyataan (2), (3), dan (4) benar.')
            explanation = explanation.replace('Maka C dan D salah.',
                                               'Maka pernyataan (3) dan (4) salah.')
            explanation += f' Kombinasi pernyataan yang benar adalah {answer}.'
        else:
            answer = key
        solutions.append({'id': number, 'correctAnswer': answer, 'explanation': explanation})

expected = 'B C C D C C D D C D C A C B D D B B C E'.replace(' ', '')
assert len(questions) == len(solutions) == 20
assert ''.join(s['correctAnswer'] for s in solutions) == expected

def write_ts(path, name, data, type_name):
    (ROOT / path).write_text(
        '// Extracted from the repository PDFs by scripts/extract-katrol.py.\n'
        f"import type {{ {type_name} }} from '../types/quiz'\n\n"
        f'export const {name}: {type_name}[] = ' + json.dumps(data, ensure_ascii=False, indent=2) + '\n')

write_ts('src/data/katrolQuestions.ts', 'katrolQuestions', questions, 'Question')
write_ts('src/data/katrolSolutions.ts', 'katrolSolutions', solutions, 'Solution')
assets = ROOT / 'public/latihan/katrol'
assets.mkdir(parents=True, exist_ok=True)
copyfile(SOURCE / 'Studywithbro_Latihan_Katrol.pdf', assets / 'Studywithbro_Paket_A_Soal.pdf')
for number, (page_index, bounds, _) in diagrams.items():
    doc = pymupdf.open()
    doc.insert_pdf(quiz, from_page=page_index, to_page=page_index)
    page = doc[0]
    x0, y0, x1, y1 = bounds
    width, height = page.rect.width, page.rect.height
    # Remove all question text and other page contents, leaving only the panel.
    for box in [(0, 0, width, y0), (0, y1, width, height),
                (0, y0, x0, y1), (x1, y0, width, y1)]:
        page.add_redact_annot(pymupdf.Rect(box), fill=False)
    page.apply_redactions(graphics=1)
    page.set_cropbox(pymupdf.Rect(bounds))
    svg = page.get_svg_image(text_as_path=True)
    (assets / f'soal-{number:02}.svg').write_text(svg)
print(f'Extracted {len(questions)} questions, {len(solutions)} verified solutions, {len(diagrams)} vector diagrams.')
