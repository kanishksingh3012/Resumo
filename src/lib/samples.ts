// Starter samples shown when a user adds their own prompt or template. These
// give people a known-good, non-breaking format to fill in, so custom content
// doesn't confuse generation. They're inserted on demand — never auto-applied.

// A clean, annotated prompt the user can adapt. It only describes HOW to tailor;
// the app always appends the required output format itself, so users never need
// to (and shouldn't) specify JSON or output structure here.
export const SAMPLE_PROMPT_TEXT =
`You are an expert resume writer. Tailor the candidate's resume to the job description provided.

WHAT TO DO
- Identify the key skills, tools, and keywords the job prioritizes.
- Rewrite the summary and the experience bullets to match the job's language and priorities.
- Lead with the most relevant experience; compress the less relevant.
- Integrate keywords naturally — no keyword stuffing.
- Keep every bullet in "action + impact" form and preserve any real metrics.

RULES
- Never invent experience, numbers, tools, or responsibilities. Only reframe what is actually in the resume.
- Keep the result concise enough to fit on a single page.

Tip: describe only HOW to tailor. You do NOT need to mention JSON, fields, or output format — the app adds and enforces that automatically.`;

// A minimal, single-page LaTeX resume skeleton that compiles in Overleaf as-is.
// Mainly a formatting reference: the app fills tailored text from the candidate's
// resume, so users can swap the placeholder content for their own structure.
export const SAMPLE_TEMPLATE_LATEX = String.raw`% Sample resume template — replace the placeholder content with your own.
% Keep it to a single page. The app fills in tailored text automatically,
% so treat this mainly as a formatting reference.
\documentclass[11pt,a4paper]{article}
\usepackage[margin=1.6cm]{geometry}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\setlist[itemize]{leftmargin=1.2em, itemsep=2pt, topsep=2pt}
\setlength{\parindent}{0pt}
\pagenumbering{gobble}

\begin{document}

{\LARGE \textbf{Your Name}}\\[3pt]
Your Title \textperiodcentered{} City, Country\\
email \textperiodcentered{} linkedin \textperiodcentered{} website\\[6pt]
\hrule
\vspace{8pt}

\textbf{\large Summary}\\[2pt]
One or two sentences about who you are and the kind of work you do.
\vspace{8pt}

\textbf{\large Experience}\\[4pt]
\textbf{Job Title}, Company \hfill Month Year -- Month Year
\begin{itemize}
  \item Achievement written as action + impact.
  \item Another bullet, with a metric where you have one.
\end{itemize}
\vspace{4pt}

\textbf{\large Skills}\\[2pt]
\textbf{Category:} skill one, skill two, skill three\\

\end{document}`;
