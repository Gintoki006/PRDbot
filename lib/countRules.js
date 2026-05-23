export function countRules(prdText) {
  // Find the enforcement rules section
  const sectionPatterns = [
    /##.*?(enforcement rules|issue rules|prdbot rules|github rules)/i,
    /##.*?rules/i,
  ];

  let sectionStart = -1;
  let sectionEnd = -1;
  const lines = prdText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    // Find the rules section heading
    if (sectionStart === -1 && sectionPatterns.some(p => p.test(lines[i]))) {
      sectionStart = i;
      continue;
    }
    // Find the next ## heading — that's where the section ends
    if (sectionStart !== -1 && /^##\s/.test(lines[i])) {
      sectionEnd = i;
      break;
    }
  }

  if (sectionStart === -1) return 0;

  const rulesSection = lines
    .slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd)
    .join('\n');

  // Count only ### Rule headings (most reliable signal)
  const explicitRules = (rulesSection.match(/^###\s+Rule\s+\d+/gim) || []).length;
  if (explicitRules > 0) return explicitRules;

  // Fallback: count numbered lines only within the section
  return lines
    .slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd)
    .filter(l => /^\d+\./.test(l.trim())).length;
}
