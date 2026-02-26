
with open('gen_premium_audit.py', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '\u2014': '--',
    '\u2013': '-',
    '\u2019': "'",
    '\u2018': "'",
    '\u201c': '"',
    '\u201d': '"',
    '\u2026': '...',
    '\u00b7': '*',
    '\u2022': '-',
    '\u00a0': ' ',
    '\u2715': 'x',
    '\u2713': 'OK',
    '\u2714': 'OK',
    '\u2716': 'x',
    '\u270c': '',
    '\u2605': '*',
}
for old, new in replacements.items():
    content = content.replace(old, new)

# Also fix the check mark in the certification text
content = content.replace('# u+2713', 'OK')

with open('gen_premium_audit.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Chars replaced OK')
