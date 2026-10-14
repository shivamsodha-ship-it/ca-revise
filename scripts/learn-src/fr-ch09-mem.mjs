// FR Ch 9 — vision (stage 1), memory aids (stage 4) and connections (stage 5).
export const vision = {
  oneLine: 'Ind AS 115 tells you when and how much revenue to recognise from contracts with customers, through one five-step model.',
  why: '<p>Revenue is the most important number in any income statement, and Ind AS 115 is examined in every FR attempt: 5–20 marks in each question paper since May 2022, plus case-scenario MCQs. It also links to ethics (premature revenue in a CA\'s professional duty case), Ind AS 109 (receivables, financing), Ind AS 116 (repurchase as lease) and Ind AS 37 (warranties, onerous contracts).</p>',
  style: 'mixed',
  marks: 'about 9 marks an attempt (5–20 in papers since May 2022)',
  map: [
    { h: 'Step 1 · Contract', items: ['Five criteria', 'Collectability', 'Contract term', 'Combining', 'Modifications'], p: ['r115-contract', 'r115-term', 'r115-combine', 'r115-mod'] },
    { h: 'Step 2 · Performance obligations', items: ['Distinct (two tests)', 'Series', 'Material rights & loyalty points', 'Principal vs agent', 'Consignment', 'Upfront fees'], p: ['r115-distinct', 'r115-series', 'r115-options', 'r115-pa', 'r115-consign', 'r115-upfront'] },
    { h: 'Step 3 · Transaction price', items: ['Variable consideration + constraint', 'Right of return', 'Warranties', 'Royalties', 'Financing', 'Non-cash', 'Payable to customer'], p: ['r115-var', 'r115-constraint', 'r115-return', 'r115-warranty', 'r115-royalty', 'r115-financing', 'r115-noncash', 'r115-payable'] },
    { h: 'Step 4 · Allocation', items: ['SSP methods', 'Discounts', 'Variable consideration', 'Price changes'], p: ['r115-ssp', 'r115-discount', 'r115-var-alloc', 'r115-tp-change'] },
    { h: 'Step 5 · Control', items: ['Over time (35a/b/c)', 'Measuring progress', 'Point in time', 'Repurchase', 'Bill-and-hold', 'Licences'], p: ['r115-overtime', 'r115-progress', 'r115-pit', 'r115-repurchase', 'r115-billhold', 'r115-licence'] },
    { h: 'Around the model', items: ['Contract costs', 'Presentation & disclosure', 'Service concessions'], p: ['r115-cost-obtain', 'r115-present', 'sca-fa-ia'] }
  ],
  sixty: [
    'Revenue = transfer of promised goods/services, at the amount you expect to be entitled to.',
    'Step 1: enforceable contract — five criteria, collection probable.',
    'Step 2: split into distinct promises; options with a material right are promises too.',
    'Step 3: price = fixed + constrained variable ± financing + non-cash − payable to customer.',
    'Step 4: share the price on stand-alone selling prices; discounts go to a bundle only with evidence.',
    'Step 5: over time if consumed as you go, customer controls WIP, or no alternative use + right to payment; else at a point in time.',
    'Special cases: returns, warranties, repurchase, bill-and-hold, licences, royalties.',
    'Costs: capitalise incremental costs to obtain and qualifying fulfilment costs.'
  ],
  askedAs: [
    { kind: 'Descriptive (4–10 marks)', how: 'A fact pattern ending "Determine how revenue will be recognised" — bill-and-hold, loyalty points, modifications, financing, SCA.' },
    { kind: 'Case-scenario MCQs', how: '2-mark MCQs on allocation (vouchers), progress, returns, barter and modifications inside a mixed case.' },
    { kind: 'Ethics fusion', how: 'Premature revenue recognition judged against Ind AS 115 and the CA\'s professional duty (RTP May 2024, RTP Nov 2026, MTP Sep 2025).' },
    { kind: 'Repeats', how: 'SM PQ 8, 9 and 10 have reappeared verbatim in RTPs; Illustrations 23, 65 and 68 return with new figures.' }
  ],
  pitfalls: [
    'Using the full voucher discount instead of the incremental discount.',
    'Including uninstalled materials in the measure of progress.',
    'Forgetting the "highly probable" constraint sentence on bonuses.',
    'Netting the refund liability against the return asset.',
    'Recognising the whole promised amount when payment is deferred beyond a year.',
    'Calling a licence "over time" because it is paid monthly.'
  ]
};

export const memory = {
  mnemonics: [
    { id: 'm-steps', for: 'The five steps', m: 'C-P-T-A-S', stands: 'Contract, Performance obligations, Transaction price, Allocate, Satisfy', story: 'A Customer Pays The Agreed Sum.', p: 'r115-core' },
    { id: 'm-criteria', for: 'Five contract criteria', m: 'A-R-P-C-C', stands: 'Approved, Rights, Payment terms, Commercial substance, Collectable', p: 'r115-contract' },
    { id: 'm-scope', for: 'Scope exclusions', m: 'LIFE', stands: 'Leases, Insurance, Financial instruments, Exchanges in the same line of business', p: 'r115-scope' },
    { id: 'm-distinct', for: 'Not separately identifiable', m: 'I-M-I', stands: 'Integration service, Modification/customisation, Interdependence', p: 'r115-distinct' },
    { id: 'm-pa', for: 'Principal indicators', m: 'R-I-P', stands: 'Responsible for fulfilment, Inventory risk, Pricing discretion', p: 'r115-pa' },
    { id: 'm-tp', for: 'What moves the price', m: 'V-F-N-P', stands: 'Variable, Financing, Non-cash, Payable to customer', p: 'r115-tp' },
    { id: 'm-overtime', for: 'Over-time criteria', m: 'C-C-N', stands: 'Consumed as performed, Customer controls WIP, No alternative use + paid for work to date', p: 'r115-overtime' },
    { id: 'm-pit', for: 'Point-in-time indicators', m: 'P-L-P-R-A', stands: 'Payment right, Legal title, Possession, Risks & rewards, Acceptance', p: 'r115-pit' },
    { id: 'm-billhold', for: 'Bill-and-hold criteria', m: 'S-S-R-R', stands: 'Substantive reason, Separately identified, Ready to ship, cannot Redirect', p: 'r115-billhold' }
  ],
  hooks: [
    { id: 'h-voucher', h: 'Voucher = extra discount × spend × chance', story: 'A 40% coupon is worth only 30% if everyone gets 10% anyway — and only if they use it.' },
    { id: 'h-elevator', h: 'Lift and shift', story: 'The elevator is lifted out of the percentage and shifted into revenue at cost.' },
    { id: 'h-repurchase', h: 'Buy back cheap = rent; buy back dear = loan', story: 'Sell at 10, buy back at 9 → you rented it out; buy back at 11 → you borrowed 10 and paid 1 interest.' }
  ]
};

export const connect = {
  links: [
    { a: 'Assurance-type warranty', b: 'Service-type warranty', kind: 'contrast', how: 'Assurance → Ind AS 37 provision; service (sold separately or beyond assurance) → performance obligation and contract liability.', p: 'r115-warranty' },
    { a: 'Consignment', b: 'Sale with right of return', kind: 'contrast', how: 'Consignee never controls the goods; a buyer with a return right does.', p: 'r115-consign' },
    { a: 'Material right', b: 'Marketing offer', kind: 'contrast', how: 'Only a discount beyond what others get is a performance obligation.', p: 'r115-options' },
    { a: 'Contract asset', b: 'Receivable', kind: 'contrast', how: 'Conditional on more performance vs only time left.', p: 'r115-present' },
    { a: 'Variable consideration', b: 'Constraint', kind: 'leads', how: 'Estimate first (EV or most likely), then include only the highly probable part.', p: 'r115-constraint' },
    { a: 'Not-distinct modification', b: 'Measure of progress', kind: 'leads', how: 'Catch-up re-runs the progress calculation with the new price.', p: 'r115-mod' },
    { a: 'Significant financing component', b: 'Ind AS 109 effective interest', kind: 'cross', how: 'Interest on the receivable or contract liability is measured under Ind AS 109.', p: 'r115-financing' },
    { a: 'Repurchase below selling price', b: 'Ind AS 116 lease', kind: 'cross', how: 'A forward or call below the original price is a lease; a put with significant incentive likewise.', p: 'r115-repurchase' },
    { a: 'Premature revenue', b: 'CA\'s professional duty (FR Ch 16)', kind: 'cross', how: 'RTP May 2024 Q12 and RTP Nov 2026 Q11 test revenue timing inside an ethics case.', p: 'r115-pit' },
    { a: 'Service concession, intangible model', b: 'Ind AS 38 and Ind AS 23', kind: 'cross', how: 'Toll licence is an intangible; borrowing costs capitalised during construction.', p: 'sca-fa-ia' },
    { a: 'Loyalty points release', b: 'Cost-to-cost progress', kind: 'same', how: 'Both release a deferred amount by cumulative proportion minus what was released earlier.', p: 'r115-options' }
  ]
};
