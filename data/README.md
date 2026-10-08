# Structured guide data

- **plays.json** is generated from guide/*.md by scripts/build.mjs. It contains chapter metadata and all 200 plays, including their action, cost, payoff, priority, and source text.
- **sources.json** records each supporting source's entry, title, URL, review date, supported claim, and limitation. A page can appear more than once when it supports different entries. Records are not independent studies or evidence-quality scores.

The Markdown chapters are the editable source of the plays. Update the source ledger alongside consequential content changes. Text and data text are licensed under CC BY 4.0; see the repository's licensing and attribution notices.
