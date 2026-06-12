// Default résumé LaTeX template shipped with the app ("Preset").
// All personal data here is placeholder/dummy — users replace it with their own.
// String.raw keeps every backslash literal so the LaTeX pastes through unescaped.
export const DEFAULT_TEMPLATE_LATEX = String.raw`\documentclass[10pt, letterpaper]{article}

\usepackage[
    ignoreheadfoot,
    top=1 cm,
    bottom=1.2 cm,
    left=1 cm,
    right=1 cm,
    footskip=0.5 cm,
]{geometry}
\usepackage{titlesec}
\usepackage{tabularx}
\usepackage{array}
\usepackage[dvipsnames]{xcolor}
\definecolor{primaryColor}{RGB}{0, 0, 0}
\usepackage{enumitem}
\usepackage{amsmath}
\usepackage[
    pdftitle={Alex Doe Resume},
    pdfauthor={Alex Doe},
    pdfcreator={LaTeX},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref}
\usepackage[pscoord]{eso-pic}
\usepackage{calc}
\usepackage{bookmark}
\usepackage{lastpage}
\usepackage{changepage}
\usepackage{paracol}
\usepackage{ifthen}
\usepackage{needspace}
\usepackage{iftex}

\ifPDFTeX
    \input{glyphtounicode}
    \pdfgentounicode=1
    \usepackage[T1]{fontenc}
    \usepackage[utf8]{inputenc}
\fi

\usepackage{charter}

\raggedright
\AtBeginEnvironment{adjustwidth}{\partopsep0pt}
\pagestyle{empty}
\setcounter{secnumdepth}{0}
\setlength{\parindent}{0pt}
\setlength{\topskip}{0pt}
\setlength{\columnsep}{0.1cm}
\pagenumbering{gobble}

\titleformat{\section}{\needspace{4\baselineskip}\bfseries\large}{}{0pt}{}[\vspace{1pt}\titlerule]

\titlespacing{\section}{
    -1pt
}{
    0.18 cm
}{
    0.10 cm
}

\renewcommand\labelitemi{$\vcenter{\hbox{\small$\bullet$}}$}
\newenvironment{highlights}{
    \begin{itemize}[
        topsep=0.05 cm,
        parsep=0.05 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0 cm + 10pt
    ]
}{
    \end{itemize}
}

\newenvironment{highlightsforbulletentries}{
    \begin{itemize}[
        topsep=0.05 cm,
        parsep=0.05 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \end{itemize}
}

\newenvironment{onecolentry}{
    \begin{adjustwidth}{0 cm + 0.00001 cm}{0 cm + 0.00001 cm}
}{
    \end{adjustwidth}
}

\newenvironment{twocolentry}[2][]{
    \onecolentry
    \def\secondColumn{#2}
    \setcolumnwidth{\fill, 4 cm}
    \begin{paracol}{2}
}{
    \switchcolumn \raggedleft \secondColumn
    \end{paracol}
    \endonecolentry
}

\newenvironment{header}{
    \setlength{\topsep}{0pt}\par\kern\topsep\centering\linespread{1.5}
}{
    \par\kern\topsep
}

\let\hrefWithoutArrow\href

\begin{document}
    \newcommand{\AND}{\unskip
        \cleaders\copy\ANDbox\hskip\wd\ANDbox
        \ignorespaces
    }
    \newsavebox\ANDbox
    \sbox\ANDbox{$|$}

    \begin{header}
        \fontsize{16 pt}{19.2 pt}\selectfont Alex Doe

        \vspace{0 pt}

        \normalsize
        \kern 2.0 pt%
        \mbox{\hrefWithoutArrow{mailto:alex.doe@example.com}{alex.doe@example.com}}%
        \kern 2.0 pt%
        \AND%
        \kern 2.0 pt%
        \mbox{\hrefWithoutArrow{tel:+15550101234}{+1 555 010 1234}}%
        \kern 2.0 pt%
        \AND%
        \kern 2.0 pt%
        \mbox{\hrefWithoutArrow{https://www.linkedin.com/in/alexdoe}{\underline{LinkedIn}}}%
        \AND%
        \kern 2.0 pt%
        \mbox{\hrefWithoutArrow{https://alexdoe.example.com}{\underline{Portfolio}}}%
        \AND%
        \mbox{City, Country}%
        \kern 2.0 pt%
    \end{header}

    \vspace{2 pt}

    \section{Summary}
    \begin{onecolentry}
        % SUMMARY PLACEHOLDER -- replace with chosen option
        Product designer with experience designing enterprise and consumer products. Focused on clean interfaces, design systems, and solving real user problems through research-driven design.
    \end{onecolentry}

    \section{Work Experience}

    \begin{twocolentry}{Month Year -- Present}
        \textbf{Product Designer}, Company A
    \end{twocolentry}
    \vspace{0.08 cm}
    \begin{onecolentry}
        \begin{highlights}
            \item Led UX research for a product revamp, synthesizing \textbf{50+} user reviews and benchmarking \textbf{4} competitor platforms to inform a full information-architecture redesign.
            \item Restructured the app IA by card-sorting \textbf{40+ elements} into \textbf{7} categories, resolving navigation, notification, and cognitive-overload issues.
            \item Designed a gamification system (badges, streaks, leaderboards) backed by survey data from \textbf{100+} users.
            \item Owned design across \textbf{6 product areas}, prototyping key compliance and reporting flows before developer handoff.
            \item Designed granular privacy controls, giving administrators individual-level configuration instead of a single global setting.
            \item Added status indicators (Ready, Active, Error) to alert components, giving users hardware context alongside every notification.
        \end{highlights}
    \end{onecolentry}

    \vspace{0.4 cm}

    \begin{twocolentry}{Month Year -- Month Year}
        \textbf{Product Design Intern}, Company B
    \end{twocolentry}
    \vspace{0.08 cm}
    \begin{onecolentry}
        \begin{highlights}
            \item Led end-to-end design of an internal AI tool as the sole designer in a \textbf{6-person} team, shipped in \textbf{6 weeks}.
            \item Architected a \textbf{4-module system} using progressive disclosure, making configuration accessible to non-technical users.
            \item Led a redesign that lifted task discovery from \textbf{40\% to 65\%} and filter engagement from \textbf{8\% to 32\%}.
            \item Built the IA and components for an internal documentation tool, centralizing content previously scattered across formats.
        \end{highlights}
    \end{onecolentry}

    \vspace{0.4 cm}

    \begin{twocolentry}{Month Year -- Month Year}
        \textbf{Analyst}, Company C
    \end{twocolentry}
    \vspace{0.08 cm}
    \begin{onecolentry}
        \begin{highlights}
            \item Analyzed market curves and macro indicators daily; executed \textbf{200+} intraday positions over \textbf{8 months}.
            \item Applied quantitative risk modeling to manage exposure across high-frequency positions.
        \end{highlights}
    \end{onecolentry}

    \section{Earlier Internships}

    \begin{twocolentry}{Month Year -- Month Year}
        \textbf{Design Intern}, Company D
    \end{twocolentry}
    \vspace{0.08 cm}
    \begin{onecolentry}
        \begin{highlights}
            \item Managed a \textbf{3-person} design team on a job-search platform, delivering IA and \textbf{4} complete user flows with direct client involvement.
        \end{highlights}
    \end{onecolentry}

    \vspace{0.2 cm}

    \begin{twocolentry}{Month Year -- Month Year}
        \textbf{Design Intern}, Company E
    \end{twocolentry}
    \vspace{0.08 cm}
    \begin{onecolentry}
        \begin{highlights}
            \item Developed onboarding and user-invitation flows for a consulting platform; ran user interviews and usability testing across \textbf{3 modules}.
        \end{highlights}
    \end{onecolentry}

    \section{Education}

    \begin{twocolentry}{Year -- Year}
        \textbf{University of Example}, B.Tech in Engineering
    \end{twocolentry}

    \section{Skills}

    \begin{onecolentry}
        \textbf{Design:} Figma, Prototyping, Wireframing, Design Systems, Interaction Design, Mobile-first design
    \end{onecolentry}
    \vspace{0.08 cm}
    \begin{onecolentry}
        \textbf{Research:} User Interviews, Usability Testing, Card Sorting, Competitive Analysis, UX Audit, Persona Development
    \end{onecolentry}
    \vspace{0.08 cm}
    \begin{onecolentry}
        \textbf{Domains:} Enterprise SaaS, AI / GenAI tools, B2C Marketplaces, Internal Tools
    \end{onecolentry}

    \section{Interests}

    \begin{onecolentry}
        Sketching and illustration, photography, film, music production, and electronics prototyping.
    \end{onecolentry}

\end{document}
`;
