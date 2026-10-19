"""Verify the supplied JSON against its PDFs (requires the pdftotext CLI).

JSON remains the app's canonical source; PDF text is used only for verification.
Whitespace is ignored because PDF extraction can join a number and its unit.
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'reference/katrol/paket-bc'


def compact(text):
    return re.sub(r'\s+', '', text)


def pdf_text(path):
    return compact(subprocess.check_output(['pdftotext', '-layout', str(path), '-'], text=True))


for pack in ['b', 'c']:
    bank = json.loads((ROOT / f'data/latihan_{pack}_katrol.json').read_text())
    questions = pdf_text(ROOT / f'pdf/Studywithbro_Paket_{pack.upper()}_Soal.pdf')
    answers = pdf_text(ROOT / f'pdf/Studywithbro_Paket_{pack.upper()}_Kunci_Pembahasan.pdf')
    assert len(bank['questions']) == 20
    for q in bank['questions']:
        assert compact(q['text']) in questions, (pack, q['id'], 'question mismatch')
        for option in q['options']:
            assert compact(option['text']) in questions, (pack, q['id'], option['id'], 'option mismatch')
        assert compact(q['explanation']) in answers, (pack, q['id'], 'explanation mismatch')
        assert f"{q['id']:02d}:{q['correctAnswer']}" in answers, (pack, q['id'], 'key mismatch')
    print(f'Paket {pack.upper()}: 20 questions, 100 options, 20 explanations and all keys match the source PDFs.')
