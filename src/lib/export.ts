import type { ResumeResult } from './types';

// Escape characters that are special in LaTeX so generated content compiles.
function escapeLatex(s: string): string {
  return (s || '')
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

// Build a clean, self-contained LaTeX document from a generated resume.
// (Compiles as-is in Overleaf; independent of the stored display template.)
export function resultToLatex(r: ResumeResult): string {
  const exp = r.experience
    .map((e) => {
      const bullets = e.bullets.map((b) => `        \\item ${escapeLatex(b)}`).join('\n');
      return `\\textbf{${escapeLatex(e.role)}}, ${escapeLatex(e.company)} \\hfill ${escapeLatex(e.dates)}
\\begin{itemize}
${bullets}
\\end{itemize}
\\vspace{4pt}`;
    })
    .join('\n\n');

  const skills = r.skills
    .map((s) => `\\textbf{${escapeLatex(s.category)}:} ${escapeLatex(s.values)}\\\\`)
    .join('\n');

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1.8cm]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\setlist[itemize]{leftmargin=1.2em, itemsep=2pt, topsep=2pt}
\\setlength{\\parindent}{0pt}
\\pagenumbering{gobble}

\\begin{document}

{\\LARGE \\textbf{${escapeLatex(r.name)}}}\\\\[3pt]
${escapeLatex(r.subtitle)}\\\\
${escapeLatex(r.contact)}\\\\[6pt]
\\hrule
\\vspace{8pt}

\\textbf{\\large Summary}\\\\[2pt]
${escapeLatex(r.summary)}
\\vspace{8pt}

\\textbf{\\large Experience}\\\\[4pt]
${exp}
\\vspace{4pt}

\\textbf{\\large Skills}\\\\[2pt]
${skills}

\\end{document}
`;
}

// Open the resume in Overleaf as a new project (POST the LaTeX to Overleaf).
export function openInOverleaf(r: ResumeResult): void {
  const latex = resultToLatex(r);
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.overleaf.com/docs';
  form.target = '_blank';
  form.style.display = 'none';

  const snip = document.createElement('input');
  snip.type = 'hidden';
  snip.name = 'snip';
  snip.value = latex;
  form.appendChild(snip);

  const name = document.createElement('input');
  name.type = 'hidden';
  name.name = 'snip_name';
  name.value = `${(r.name || 'resume').replace(/\s+/g, '_')}.tex`;
  form.appendChild(name);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function esc(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Render the resume into a hidden iframe and open the print dialog
// (the user picks "Save as PDF"). Avoids popup blockers.
export function downloadResumePdf(r: ResumeResult): void {
  const expHtml = r.experience
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-head"><span class="role">${esc(e.role)}</span><span class="dates">${esc(e.dates)}</span></div>
      <div class="company">${esc(e.company)}</div>
      <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>`
    )
    .join('');

  const skillsHtml = r.skills
    .map((s) => `<div class="skill"><span class="cat">${esc(s.category)}</span><span>${esc(s.values)}</span></div>`)
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
<title>${esc(r.name)} — Resume</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #111827; font-size: 11pt; line-height: 1.45; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 2px; }
  .subtitle { color: #374151; font-size: 11pt; }
  .contact { color: #6B7280; font-size: 9.5pt; margin-top: 2px; }
  hr { border: none; border-top: 1px solid #C8C7BF; margin: 10px 0; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #E5E4DE; padding-bottom: 3px; margin: 14px 0 8px; }
  .entry { margin-bottom: 10px; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; }
  .role { font-weight: bold; }
  .dates { color: #6B7280; font-size: 9.5pt; }
  .company { color: #374151; font-size: 10pt; margin-bottom: 3px; }
  ul { margin: 0; padding-left: 16px; }
  li { margin-bottom: 2px; }
  .skill { display: flex; gap: 10px; margin-bottom: 3px; }
  .skill .cat { font-weight: 600; min-width: 90px; }
</style></head>
<body>
  <h1>${esc(r.name)}</h1>
  <div class="subtitle">${esc(r.subtitle)}</div>
  <div class="contact">${esc(r.contact)}</div>
  <hr />
  <h2>Summary</h2>
  <p>${esc(r.summary)}</p>
  <h2>Experience</h2>
  ${expHtml}
  <h2>Skills</h2>
  ${skillsHtml}
</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}
