# Contributing

Useful corrections are specific. Open an issue or pull request with the entry ID, the proposed change, the applicable place and date, and a primary source that supports the claim. If a page moved, supply the replacement official URL and identify whether the rule also changed.

Do not post account numbers, medical records, identity documents, private correspondence, or identifiable details of someone else's case. The repository cannot resolve individual emergencies or benefit applications.

## Editorial checklist

- Keep the action understandable to someone encountering this system for the first time.
- Say who qualifies and what varies. Separate federal rules from a state example.
- Include actual costs and practical effort; mark estimates as estimates.
- Explain possible payoff without inventing a guaranteed result or savings amount.
- Use Rule, Guidance, and Practice accurately. Do not label editorial advice as clinical evidence.
- Link the page supporting the claim, not a search result. Add or update the source ledger.
- Keep commercial referrals, affiliate links, and promotional content out of the guide.
- Respect licenses. Credit upstream inspiration and indicate changes.

## Files to change

Edit the relevant Markdown file in guide/ and corresponding data/sources.json records. Keep stable entry IDs whenever possible. Update CHANGELOG.md for substantive changes. Run node scripts/build.mjs to regenerate index.html and data/plays.json, and run node scripts/check.mjs for structural checks. Check the reader's search, filters, saved entries, navigation, and print view after a reader change.

For a proposed new topic, explain the distinct reader problem and why an existing entry cannot handle it. Five entries per topic is the first edition's layout, not a restriction on future useful work.
