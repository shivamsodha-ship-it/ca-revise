// FR Ch 9 Ind AS 115 — mastery levels. Facts from data/fr/ch09-casebook.json (SM May 2026 onwards) only.
const mc = (q, opts, ans, why) => ({ k: 'mc', q, opts, ans, why });
const tf = (q, ans, why) => ({ k: 'tf', q, ans, why });
const num = (q, ans, unit, why, tol) => ({ k: 'num', q, ans, unit, why, ...(tol !== undefined ? { tol } : {}) });
const order = (q, items, why) => ({ k: 'order', q, items, why });

export default [
  {
    id: 'l01-core', title: 'The core principle and the five steps', hook: 'Every Ind AS 115 answer is written by walking the five steps — examiners give marks step by step.', mins: 6,
    links: ['r115-core', 'r115-scope'],
    teach: [
      { h: 'One sentence', html: '<p>Recognise revenue to show the <strong>transfer of promised goods or services</strong> at the amount the entity <strong>expects to be entitled to</strong>.</p>' },
      { h: 'Five steps', html: '<ul><li>1 Identify the contract</li><li>2 Identify the performance obligations</li><li>3 Determine the transaction price</li><li>4 Allocate it to the performance obligations</li><li>5 Recognise revenue when (or as) control transfers</li></ul>' },
      { h: 'What is out of scope', html: '<p>Leases (Ind AS 116), insurance (Ind AS 117), financial instruments and interests in other entities (Ind AS 109/110/111/27/28), and <strong>non-monetary exchanges between entities in the same line of business</strong> to facilitate sales. Barter of dissimilar services (talk time for power) is in scope.</p>' }
    ],
    picture: '<table><tr><th>Step</th><th>Question you ask</th></tr><tr><td>1</td><td>Is there an enforceable contract?</td></tr><tr><td>2</td><td>What distinct things did we promise?</td></tr><tr><td>3</td><td>How much do we expect to get?</td></tr><tr><td>4</td><td>How much belongs to each promise?</td></tr><tr><td>5</td><td>When does the customer get control?</td></tr></table>',
    recall: [
      order('Put the five steps in order.', ['Identify the contract', 'Identify the performance obligations', 'Determine the transaction price', 'Allocate the transaction price', 'Recognise revenue when control transfers'], 'Contract first: it is the gateway to the other four.'),
      tf('Two oil companies swapping oil to meet each other\'s customers\' demand is within Ind AS 115.', false, 'Excluded: a non-monetary exchange between entities in the same line of business to facilitate sales (para 5(d)).'),
      mc('A telecom company gives 1,00,000 minutes of talk time (₹0.50 a minute) to a power company in exchange for 20,000 units of power (₹2.5 a unit). Revenue of the telecom company?', ['Nil — barter is excluded', '₹50,000', '₹1,00,000', '₹25,000'], 1, 'Dissimilar exchange → in scope; measure non-cash consideration at fair value: 20,000 × ₹2.5 = ₹50,000 (SM TYK 2).')
    ],
    twist: { q: 'What if both companies sold identical goods and swapped them to serve customers in other cities?', a: 'Then it is a same-line-of-business exchange to facilitate sales — outside Ind AS 115, no revenue.' }
  },
  {
    id: 'l02-contract', title: 'Step 1 — does a contract exist, and for how long?', hook: 'Collectability and termination rights are favourite one-paragraph theory questions.', mins: 8,
    links: ['r115-contract', 'r115-term', 'r115-combine'],
    teach: [
      { h: 'Five criteria (all)', html: '<p>Approved and committed; rights identifiable; payment terms identifiable; <strong>commercial substance</strong>; <strong>probable</strong> (more likely than not) collection of what the entity expects to be entitled to.</p>' },
      { h: 'If the criteria fail', html: '<p>Consideration received is a <strong>liability</strong> until the criteria are met, or the entity has no remaining obligations and has received substantially all non-refundable consideration, or the contract is terminated and the amount is non-refundable (paras 15–16).</p>' },
      { h: 'Term and combining', html: '<p>Account only for the period with <strong>enforceable</strong> rights: a 12-month gym membership cancellable without penalty after 3 months is a 3-month contract. Combine contracts with the same customer (or its related parties) at or near the same time if negotiated as a package, prices are inter-dependent, or they form one performance obligation.</p>' }
    ],
    correlate: '<p>Collectability looks at the amount the entity <em>expects</em> — after any expected <a class="xref" href="#" data-p="r115-var">price concession</a>. That is why SM TYK 5 tests ₹1.75 million, not ₹2 million.</p>',
    recall: [
      mc('G Ltd. sells machinery for ₹20 lakh; the buyer pays ₹1 lakh and the rest on non-recourse finance out of a risky new business. How does G Ltd. treat the ₹1 lakh?', ['Revenue ₹20 lakh on delivery', 'Revenue ₹1 lakh', 'Deposit liability until the para 9 criteria are met or a para 15 event occurs', 'Other income'], 2, 'Collection is not probable, so no contract exists for Ind AS 115; the deposit is a liability (SM TYK 4).'),
      num('A gym contract is 12 months at ₹4,500 a month, cancellable without penalty after 3 months. Contract term in months?', 3, 'months', 'Enforceable rights exist only for 3 months (SM Illustration 2).', 0),
      tf('Two contracts with the same government\'s two entities, signed a week apart with a deep discount only if both buy, should be combined.', true, 'Related parties, near the same time, single package and inter-dependent price (SM Illustration 6).')
    ],
    twist: { q: 'The gym member would pay a substantive penalty for cancelling at any time in the year. Term?', a: '12 months — a substantive termination penalty is evidence of enforceable rights for the whole period it covers.' }
  },
  {
    id: 'l03-mod', title: 'Contract modifications', hook: 'Asked in nearly every attempt as PQ 8 or a variant: bonus constrained, then modification with catch-up.', mins: 9,
    links: ['r115-mod', 'r115-constraint'],
    teach: [
      { h: 'Three routes', html: '<ul><li><strong>Separate contract</strong>: distinct goods added at their stand-alone price.</li><li><strong>Terminate and start again</strong> (prospective): remaining goods distinct.</li><li><strong>Cumulative catch-up</strong>: remaining goods not distinct, part of one partly satisfied obligation.</li></ul>' },
      { h: 'Catch-up in numbers', html: '<p>Blend the price: (original + added) ÷ revised total units; re-book work done at the blended rate; the difference hits revenue now. SM Illustration 9: ₹35,000 ÷ 250 = ₹140; 100 × ₹140 − ₹15,000 = ₹(1,000).</p>' }
    ],
    picture: '<table><tr><th>Remaining goods/services</th><th>Treatment</th></tr><tr><td>Distinct + priced at SSP</td><td>Separate contract</td></tr><tr><td>Distinct</td><td>Prospective (new contract)</td></tr><tr><td>Not distinct</td><td>Cumulative catch-up</td></tr></table>',
    recall: [
      num('200 hours at ₹300; after 100 hours, 50 more hours added at ₹200. Cumulative catch-up adjustment (₹)?', -2000, '₹', '(60,000 + 10,000) ÷ 250 = ₹280; 100 × 280 − 30,000 = −2,000 (PYQ May 2026 MCQ 12; method of SM Illustration 9).', 1),
      mc('30 extra products at ₹950 (their stand-alone price) are added to a 120-unit order at ₹1,000. Treatment?', ['Cumulative catch-up', 'Separate contract', 'Reduce price of all 150 units', 'Prospective re-allocation of the whole contract'], 1, 'Distinct goods at stand-alone price → separate contract (SM Illustration 7).'),
      tf('A retention credit the customer did not expect, given in month 14, is variable consideration.', false, 'It is a change in price accounted for as a contract modification over the remaining term (SM Illustration 58).')
    ],
    twist: { q: 'In PQ 8, the modification also extends the bonus deadline so the bonus becomes highly probable. What changes?', a: 'Include the ₹2,50,000 bonus in the transaction price with the modification and re-run the catch-up: 60.60% × ₹24,00,000 − ₹13,00,000 = ₹1,54,400.' }
  },
  {
    id: 'l04-po', title: 'Step 2 — distinct performance obligations and series', hook: 'Case scenarios love bundles: software + installation + updates, telecom + modem, property + golf membership.', mins: 9,
    links: ['r115-distinct', 'r115-series', 'r115-upfront'],
    teach: [
      { h: 'Two tests', html: '<p><strong>Capable</strong> of being distinct (benefit alone or with readily available resources) <strong>and</strong> distinct <strong>in the context of the contract</strong> (no significant integration, modification/customisation or high interdependence).</p>' },
      { h: 'Implied promises', html: '<p>Customary practice, published policies or advertising can create performance obligations (free maintenance advertised by a carmaker; free support to a reseller\'s customers).</p>' },
      { h: 'Series', html: '<p>Distinct services that are substantially the same and transfer over time with the same progress measure are <strong>one</strong> performance obligation — mandatory (cleaning, payroll, hotel management).</p>' }
    ],
    picture: '<table><tr><th>Bundle</th><th>Performance obligations</th></tr><tr><td>Water purification plant with integration</td><td>1</td></tr><tr><td>Broadband + voice + modem</td><td>3</td></tr><tr><td>Licence + installation + updates + support</td><td>4</td></tr><tr><td>Same, but installation significantly customises</td><td>3</td></tr><tr><td>Anti-virus licence + critical updates</td><td>1</td></tr></table>',
    recall: [
      num('Software licence, installation (routine, others can do it), unspecified updates and two-year support. How many performance obligations?', 4, '', 'Each is distinct (SM Illustration 15).', 0),
      tf('A telecom activation fee is a separate performance obligation.', false, 'Activation transfers nothing to the customer; the fee is an advance for the data service (SM Illustration 28).'),
      mc('In a property sale, which item is LIKELY to be a separate performance obligation?', ['Common areas', 'Construction services and materials', 'Golf membership', 'Undivided interest in land in an apartment block'], 2, 'Property management and golf membership can be used alone and are not integrated with the property (SM PQ 6).')
    ],
    twist: { q: 'In the software contract the installation now adds significant new functionality to interface with other systems. How many performance obligations?', a: 'Three: customised installation including the licence (one), updates, support (SM Illustration 16).' }
  },
  {
    id: 'l05-options', title: 'Customer options, loyalty points, principal vs agent, consignment', hook: 'Material rights are the single most-asked Ind AS 115 topic in the 2022–26 papers.', mins: 10,
    links: ['r115-options', 'r115-pa', 'r115-consign'],
    teach: [
      { h: 'Material right', html: '<p>An option is a separate performance obligation only if it gives a discount the customer would not get without the contract. Price it: expected spend × <strong>incremental</strong> discount × likelihood of use; then allocate on relative SSPs.</p>' },
      { h: 'Points', html: '<p>Defer points at sale: Sale × points value ÷ (sale + points value), where points value reflects expected redemption. Release as points are redeemed: deferred × redeemed to date ÷ total expected − released earlier.</p>' },
      { h: 'Principal or agent', html: '<p>Does the entity <strong>control</strong> the good or service before transfer? Indicators: primary responsibility, inventory risk, pricing discretion. Principal → gross; agent → net commission.</p>' }
    ],
    correlate: '<p>Points redeemable with a partner bring in <a class="xref" href="#" data-p="r115-pa">principal vs agent</a>; consignment differs from a <a class="xref" href="#" data-p="r115-return">right of return</a> because the consignee never gets control.</p>',
    recall: [
      num('Sale ₹1,000 with a 40% voucher; everyone gets 10% anyway; 80% likely to be used on ₹500 of purchases. Allocated to the voucher (₹, nearest 10)?', 110, '₹', 'SSP = 500 × 30% × 80% = 120; 120 ÷ 1,120 × 1,000 ≈ 110 (SM Illustration 23).', 10),
      num('100 points (SSP ₹500) earned on a ₹10,000 stay. Allocated to points (₹)?', 476, '₹', '10,000 × 500 ÷ 10,500 = 476 (SM PQ 9).', 1),
      mc('A travel entity buys tickets in advance, bears unsold-ticket risk and sets resale prices. It is…', ['An agent — revenue net', 'A principal — revenue gross', 'An agent because the airline flies the plane', 'Neither'], 1, 'It controls the ticket (right to fly) before transfer (SM Illustration 26).')
    ],
    twist: { q: 'Seasonal discount for everyone rises from 10% to 40%. Is the voucher still a material right?', a: 'No — it gives no discount beyond what any customer gets; it is a marketing offer accounted for only when used.' }
  },
  {
    id: 'l06-variable', title: 'Step 3 — variable consideration, the constraint, returns and warranties', hook: 'Numerical heavyweights: volume tiers, returns and bonuses appear in RTPs, MTPs and papers.', mins: 11,
    links: ['r115-var', 'r115-constraint', 'r115-return', 'r115-warranty'],
    teach: [
      { h: 'Estimate', html: '<p><strong>Expected value</strong> for a range; <strong>most likely amount</strong> for two outcomes. One method per uncertainty, applied consistently.</p>' },
      { h: 'Constrain', html: '<p>Include only what is <strong>highly probable</strong> not to reverse significantly — think market-linked fees, long uncertainty, little experience, broad concessions.</p>' },
      { h: 'Returns and warranties', html: '<p>Return right: revenue on units kept, refund liability, asset for goods coming back at cost. Warranty you can buy separately (or service beyond assurance) → performance obligation; basic assurance → Ind AS 37 provision.</p>' }
    ],
    picture: '<table><tr><th>Situation</th><th>Method</th></tr><tr><td>Bonus 15%/10%/5%/0% with probabilities</td><td>Expected value</td></tr><tr><td>Bonus earned or not</td><td>Most likely</td></tr><tr><td>Fee linked to market index over 5 years</td><td>Constrained to nil</td></tr></table>',
    recall: [
      num('1,000 products at ₹50, cost ₹30, 970 expected to be kept. Refund liability (₹)?', 1500, '₹', '30 × ₹50 = 1,500; revenue 48,500; asset 30 × ₹30 = 900 (SM Illustration 34).', 1),
      num('Volume tiers: estimate 2.8 million containers → ₹90; 7,00,000 sold at ₹100 in Q1. Liability (₹ million)?', 7, '', '7,00,000 × ₹10 = ₹7 million; revenue ₹63 million (SM TYK 6).', 0.01),
      mc('Computer ₹36,000 with an extended warranty sold separately (SSPs ₹32,000 / ₹4,000) and 90-day assurance cost ₹2,000. Revenue on sale?', ['₹36,000', '₹34,000', '₹32,000', '₹30,000'], 2, '₹4,000 is a contract liability; ₹2,000 is a warranty provision (SM Illustration 35).')
    ],
    twist: { q: 'The product is new and there is no evidence of returns. What happens to revenue at delivery?', a: 'The constraint may stop any revenue being recognised until the return period ends (SM Illustration 38).' }
  },
  {
    id: 'l07-financing', title: 'Financing, non-cash consideration and amounts payable to customers', hook: 'Financing questions recur in RTP Nov 2024 and the 2022–26 papers with a twist on the discount rate.', mins: 10,
    links: ['r115-financing', 'r115-noncash', 'r115-payable'],
    teach: [
      { h: 'Financing', html: '<p>Revenue at the <strong>cash selling price</strong>; interest separately, at the rate of a separate financing transaction (not updated later). No adjustment if the gap is ≤ 1 year, the customer controls timing of prepaid services, a royalty drives the amount, or the gap is for protection (retention money).</p>' },
      { h: 'Non-cash', html: '<p>Fair value at inception; later changes due to the form (share price) ignored; changes due to performance are variable consideration.</p>' },
      { h: 'Payable to customer', html: '<p>Slotting fees, shelving payments, port-in credits reduce the price — unless paid for a distinct good or service at fair value.</p>' }
    ],
    recall: [
      num('₹1,21,000 due in 24 months, cash price ₹1,00,000. Interest income over the period (₹)?', 21000, '₹', '₹1,21,000 − ₹1,00,000 (SM Illustration 38).', 1),
      num('Advance ₹4,000 two years before delivery at 6%. Revenue at delivery (₹)?', 4494, '₹', '4,000 × 1.06² = 4,494.40 (SM Illustration 40).', 1),
      num('₹800 a month for 24 months with a ₹2,000 port-in credit. Transaction price (₹)?', 17200, '₹', '19,200 − 2,000 (SM Illustration 53).', 1)
    ],
    twist: { q: 'The contract rate is 10% but the customer would borrow at 14%. Which rate sets revenue?', a: '14% — the rate of a separate financing transaction; revenue = PV of the instalments at 14% (₹91,31,346 in SM Illustration 39).' }
  },
  {
    id: 'l08-allocate', title: 'Step 4 — allocation, discounts and variable consideration', hook: 'Allocation tables earn easy marks if the SSP order and the para 82 test are right.', mins: 9,
    links: ['r115-ssp', 'r115-discount', 'r115-var-alloc', 'r115-tp-change'],
    teach: [
      { h: 'SSP', html: '<p>Observable price first; else adjusted market assessment, expected cost plus margin, or residual (only if highly variable or uncertain).</p>' },
      { h: 'Discount', html: '<p>Spread proportionately unless the entity regularly sells a bundle at that discount (para 82) — then the discount goes to that bundle, before any residual estimate.</p>' },
      { h: 'Variable amounts and later changes', html: '<p>Allocate variable consideration entirely to one obligation only if it relates to that obligation and the result is consistent with the objective. Later changes follow the inception basis.</p>' }
    ],
    recall: [
      num('X ₹50,000, Y ₹25,000, Z ₹45,000; Y+Z regularly ₹50,000; all three sold for ₹1,00,000, Y and Z delivered at different times. Allocated to Y (₹)?', 17857, '₹', '50,000 × 25,000 ÷ 70,000 (SM Illustration 55 Case A).', 1),
      tf('The residual approach can be used whenever a stand-alone selling price is not observable.', false, 'Only if the price is highly variable or uncertain; then check the result is within the observed range.'),
      num('₹20 lakh bonus becomes highly probable for software implementation (allocated ₹1 crore), now 60% complete. Cumulative revenue for that obligation (₹ lakh)?', 72, '', '60% × ₹120 lakh (SM Illustration 57).', 0.01)
    ],
    twist: { q: 'With Product Alpha added and a total price of ₹1,05,000, the residual for Alpha is ₹5,000 against a range of ₹15,000–₹45,000. What now?', a: 'Residual is not faithful; estimate Alpha\'s SSP by another method and allocate ₹1,05,000 on relative SSPs.' }
  },
  {
    id: 'l09-control', title: 'Step 5 — over time or point in time, progress, repurchase, bill-and-hold, licences', hook: 'Bill-and-hold and licence nature appear repeatedly, almost verbatim from the SM.', mins: 12,
    links: ['r115-overtime', 'r115-progress', 'r115-pit', 'r115-repurchase', 'r115-billhold', 'r115-licence'],
    teach: [
      { h: 'Over time if any one', html: '<p>(a) customer consumes as you perform; (b) customer controls the asset as it is built; (c) no alternative use <strong>and</strong> an enforceable right to payment (cost + reasonable margin) for work to date.</p>' },
      { h: 'Progress', html: '<p>Single method; exclude inputs that do not show progress; uninstalled materials at zero margin outside the percentage.</p>' },
      { h: 'Special cases', html: '<p>Repurchase: call/forward below price = lease, at/above = financing; put depends on economic incentive. Bill-and-hold needs a substantive reason, separate identification, readiness and no ability to redirect, plus custodial service. Licence: access (over time) only if the entity\'s activities significantly affect the IP and expose the customer and are not separate goods.</p>' }
    ],
    picture: '<table><tr><th>Fact</th><th>Answer</th></tr><tr><td>Specialised satellite, right to cost + margin on termination</td><td>Over time (35c)</td></tr><tr><td>Only keeps payments received on termination</td><td>Point in time</td></tr><tr><td>Sale ₹1 million, call at ₹1.1 million</td><td>Financing</td></tr><tr><td>Sale ₹10,00,000, put at ₹9,00,000, market ₹7,50,000</td><td>Lease</td></tr><tr><td>1975 symphony recording</td><td>Right to use</td></tr><tr><td>Sports team name while the team plays</td><td>Right to access</td></tr></table>',
    recall: [
      num('Transaction price ₹50 lakh; elevators ₹15 lakh delivered early; other costs ₹5 lakh of ₹25 lakh incurred. Revenue (₹ lakh)?', 22, '', '20% × 35 + 15 = 22 (SM Illustration 65).', 0.01),
      mc('Which is NOT a bill-and-hold criterion?', ['Substantive reason for the arrangement', 'Product separately identified as the customer\'s', 'Customer has paid in full', 'Entity cannot use or redirect the product'], 2, 'Payment is not one of the four criteria; readiness for physical transfer is.'),
      tf('A franchise where the franchisor must keep maintaining the brand gives a right to use, recognised at a point in time.', false, 'It is a right to access — up-front fee recognised over the franchise period (SM PQ 4).')
    ],
    twist: { q: 'In the put option case the expected market price rises to ₹9,50,000 (above the ₹9,00,000 put price). What changes?', a: 'No significant economic incentive to exercise → account as a sale with a right of return, not a lease.' }
  },
  {
    id: 'l10-costs-sca', title: 'Contract costs, presentation and service concessions', hook: 'SCA carried 10 marks in Nov 2022; contract costs are a quick theory MCQ.', mins: 8,
    links: ['r115-cost-obtain', 'r115-cost-fulfil', 'r115-cost-amort', 'r115-present', 'sca-scope', 'sca-fa-ia'],
    teach: [
      { h: 'Costs', html: '<p>Capitalise incremental costs to obtain (commission on signing) if recoverable; expense if amortisation ≤ 1 year. Capitalise fulfilment costs outside other standards only if direct, resource-generating and recoverable. Amortise over the expected period including renewals.</p>' },
      { h: 'Presentation', html: '<p>Paid first → contract liability. Performed first: conditional right → contract asset; only time left → receivable.</p>' },
      { h: 'Service concessions', html: '<p>Infrastructure is not the operator\'s PPE. Guaranteed cash from the grantor → financial asset; right to collect tolls → intangible asset. Borrowing costs capitalised only in the intangible model.</p>' }
    ],
    recall: [
      mc('Which cost is capitalised as a cost to obtain a contract?', ['Legal fees for drafting', 'Travel to pitch the client', 'Commission payable only on signing', 'Sales staff salaries'], 2, 'Only the commission is incremental (SM 10.1).'),
      num('Five-year contract renewable yearly to 10; customers stay 7 years on average. Amortisation period (years)?', 7, 'years', 'Initial term plus expected renewals (SM Illustration 74).', 0),
      mc('Government guarantees ₹200 crore to the toll-road operator. The operator recognises…', ['PPE for the road', 'An intangible asset', 'A financial asset', 'No asset'], 2, 'Unconditional right to cash → financial asset (SM Illustration 75(I)).')
    ],
    twist: { q: 'The operator instead collects tolls from road users with no guarantee. What changes in the accounts?', a: 'Intangible asset model: Dr Intangible asset / Cr Revenue at the fair value of construction; amortise over the operation period; borrowing costs capitalised during construction.' }
  }
];
