# Methodology and limits

## What this is

An independent, English-language U.S. adaptation of the practical premise behind HowToLiveBetter: make useful actions easier to find and compare. The 200 numbered plays are newly written for U.S. systems. They are a selected reference, not an exhaustive encyclopedia or a personalized plan. Forty topics broaden the organizational map; five entries per topic keep the first edition readable. Entries sometimes reinforce a protection in different contexts, such as credit freezes or medical decision-makers. The count is a transparent publishing count, not 200 distinct scientific discoveries.

## How a play is written

Each play contains an action, enough context to start, cost and effort, possible payoff, priority, and basis with source links. Dollar savings and health-effect percentages are omitted when they cannot be supported for the reader's situation. Cost and time estimates are editorial estimates, not measured research findings or quotes. “Free” generally describes an application, public resource, or inquiry; services, transport, missed work, internet access, and follow-up may still cost money.

## Basis labels

| Label | Meaning | What it does not establish |
| --- | --- | --- |
| Rule | A cited official explanation of a policy, eligibility test, right, or legal requirement | That every reader qualifies, that a rule is identical everywhere, or that the summary is legal advice |
| Guidance | A recommendation from the identified health, government, professional, or other source | A guaranteed result or a uniform scientific evidence grade |
| Practice | An editorial workflow, organizational habit, or practical implementation suggestion | A claim that a controlled trial validated this exact workflow |

Mixed labels distinguish entries that combine these elements. Legal authority and clinical evidence answer different questions, so they are not placed on one A/B/C scale. The guide does not independently grade trial quality or reproduce a systematic review. A linked government page is useful evidence of the agency's explanation, not a guarantee that every sentence is statutory language.

## Priority labels

**Start here** flags generally useful protection or a foundation. **Build next** fits work after immediate needs. **When relevant** is triggered by an event or circumstance. These are editorial navigation labels, not a numerical return-on-investment ranking. A relevant legal or medical deadline can make any entry urgent. Health, money, time, and autonomy are not converted into one score.

## Source workflow

Sources were selected primarily from U.S. government agencies, courts, and named professional or clinical organizations. Supporting pages were opened during drafting; the ledger records the claim supported and its main limitation. The recorded review date is **2026-10-09**, using the editor's local date. Most sources are living webpages. This edition is a snapshot, and the record does not assert continuous monitoring or archive preservation.

[data/sources.json](data/sources.json) contains source records attached to entries. Some entries have multiple records and the same page may support multiple entries; record count is not a count of independent studies. An entry's direct links are the first place to check. The scenario lists and scripts mostly reuse linked plays; additional sources for the after-death checklist are identified there and in the ledger. Chapter 40's workflow suggestions are explicitly original editorial practice and link here.

AI assisted drafting, source lookup, and consistency review. No claim of independent medical, legal, financial, or peer review is made. Official sources can be incomplete, outdated, or difficult to interpret; correction reports are welcome. A confident writing style does not remove those limitations.

## Things that need current, local verification

- State and tribal benefits, landlord-tenant rules, family law, probate, recording law, workers' compensation, and filing deadlines.
- Eligibility tied to income, household, disability, immigration status, age, employment, or program capacity.
- Annual tax thresholds, contribution limits, open-enrollment dates, aid deadlines, and loan repayment rules.
- Insurance plan networks, formularies, exclusions, cost sharing, and appeal procedures.
- Destination-country entry, employment, medicine, and tax rules for travel or relocation.

The guide does not assume that eligibility for one program qualifies someone for another. Federal rules are a starting point; territories and tribal jurisdictions may have distinct administration or applicability. Clinical decisions belong with a qualified clinician who knows the person's history. Use current official instructions and relevant professional help when the stakes justify it.

## Editorial commitments

No paid placement, affiliate links, invented savings, guaranteed returns, or unsupported universal eligibility claims in this edition. Public corrections should identify the entry, the problem, the jurisdiction or date, and a primary source. Personal case histories should not be posted to public issues. Changes to consequential guidance require source review, not just copyediting.

## Rebuild the reader

The Markdown files in guide/ are the editable content. Run the dependency-free Node script from the repository root:

```sh
node scripts/build.mjs
```

This regenerates the standalone reader and structured entry data. No runtime server is needed to read the generated HTML. Bookmarks are device/browser-local and are not backed up or synchronized; storage availability can vary, especially for local files.

[Back to the playbook](README.md)
