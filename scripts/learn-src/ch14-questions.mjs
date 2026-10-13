// Extra casebook questions for Ch 14: CFA-style concept questions and "one line of the SM" twists.
// All are app-written (labelled as such). Figures are recomputed in scripts/merge-ch14-additions.mjs.
const CFA = 'CFA-style (app-written)';
const LN = 'Built from one line of the SM (app-written)';
const tbl = rows => `<table>${rows.map((r, i) => `<tr>${r.map(c => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</table>`;

export const questions = [
  // ---------------- CFA-style ----------------
  {
    id: 'CF1', k: 'cfa', v: 'Numerical', src: CFA + ' · bank capital ratios', links: ['bank-capital-crar'],
    q: `<p>An analyst compares capital ratios of a bank. Common Equity Tier 1 (CET1) ₹4,500 crore; Additional Tier 1 (AT1) ₹1,000 crore; Tier 2 ₹1,500 crore; risk-weighted assets ₹60,000 crore; total exposure measure ₹1,25,000 crore. Compute the CET1 ratio, Tier 1 ratio, total capital ratio and the leverage ratio (Tier 1 ÷ exposure). Then management moves ₹10,000 crore of housing loans (50% risk weight) into commercial real estate (100%). Recompute the total capital ratio and comment on the RBI minimum of 9% used in the SM.</p>`,
    a: `<p><strong>Concept:</strong> capital ratios divide different layers of capital by risk-weighted assets; the leverage ratio ignores risk weights.</p>` + tbl([['Measure', 'Working', 'Result'], ['CET1 ratio', '4,500 ÷ 60,000', '7.50%'], ['Tier 1 ratio', '(4,500 + 1,000) ÷ 60,000', '9.17%'], ['Total capital ratio', '7,000 ÷ 60,000', '11.67%'], ['Leverage ratio', '5,500 ÷ 1,25,000', '4.40%'], ['RWA after shift', '60,000 + 10,000 × (100% − 50%) = 65,000', ''], ['Total capital ratio after shift', '7,000 ÷ 65,000', '10.77%']]) + `<p><strong>Conclusion:</strong> the shift costs about 0.9 percentage points of capital ratio with no change in capital: same loans, riskier mix. Both before and after, the total ratio is above the SM's 9% bank minimum. <em>Beyond the SM: CET1, AT1 and the leverage ratio are Basel III terms; the SM states only the 9% CRAR. Check RBI\'s current component minima before quoting them.</em></p>`,
    trap: `<p>Using the same denominator for the leverage ratio. Leverage uses total exposure, not risk-weighted assets.</p>`,
    nums: [['CET1 ratio', 7.5, '%'], ['Tier 1 ratio', 9.17, '%'], ['Total capital ratio', 11.67, '%'], ['Leverage ratio', 4.4, '%'], ['Total capital ratio after the shift', 10.77, '%']],
  },
  {
    id: 'CF2', k: 'cfa', v: 'Numerical', src: CFA + ' · expected credit loss vs prudential provision', links: ['nbfc-provisioning', 'nbfc-indas-applic'],
    q: `<p>An Ind AS NBFC in the Middle Layer reports (₹ crore): Stage 1 loans 200 (12-month PD 1%, LGD 40%); Stage 2 loans 30 (lifetime PD 10%, LGD 40%); Stage 3 loan 20 (credit-impaired, PD 100%, LGD 25%), which has been NPA for 30 months with realisable security of 12. (a) Compute the total expected credit loss (ECL = exposure × PD × LGD). (b) Compute the provision under the prudential (IRAC) norms: standard assets at 0.40%, doubtful secured portion at the rate for the time as doubtful, unsecured portion at 100%. (c) What happens to the difference?</p>`,
    a: `<p><strong>(a) ECL:</strong> Stage 1: 200 × 1% × 40% = 0.8. Stage 2: 30 × 10% × 40% = 1.2. Stage 3: 20 × 100% × 25% = 5.0. <strong>Total ECL = 7.0</strong>.</p><p><strong>(b) Prudential provision:</strong> standard assets (Stage 1 and 2) 230 × 0.40% = 0.92. Stage 3 loan: Middle Layer, doubtful after 12 months, so 18 months as doubtful (between 1 and 3 years): unsecured 20 − 12 = 8 × 100% = 8.0; secured 12 × 30% = 3.6. <strong>Total = 0.92 + 8.0 + 3.6 = 12.52</strong>.</p><p><strong>(c)</strong> ECL (7.0) is lower than the prudential provision (12.52). Under RBI's approach for Ind AS NBFCs the shortfall of <strong>5.52</strong> is transferred from profit to an <strong>Impairment Reserve</strong>. <em>Beyond the SM: confirm the latest RBI wording on the Impairment Reserve; the numbers above use the SM's provisioning table.</em></p>`,
    trap: `<p>Treating Stage 2 loans as NPAs under IRAC. Stage 2 is an accounting stage (significant increase in credit risk); under IRAC it is still a standard asset.</p>`,
    nums: [['Total ECL', 7, '₹ crore', 0.01], ['Prudential (IRAC) provision', 12.52, '₹ crore', 0.01], ['Transfer to Impairment Reserve', 5.52, '₹ crore', 0.01]],
  },
  {
    id: 'CF3', k: 'cfa', v: 'Numerical', src: CFA + ' · liquidity coverage', links: ['bank-crr-slr'],
    q: `<p>A bank holds high-quality liquid assets (HQLA) of ₹8,100 crore. Over a 30-day stress: stable retail deposits ₹30,000 crore run off at 5%; less-stable retail deposits ₹20,000 crore at 10%; wholesale funding ₹25,000 crore at 40%. Expected inflows are ₹4,500 crore (assume inflows count in full, within the cap). (a) Compute the Liquidity Coverage Ratio (HQLA ÷ net cash outflows). (b) Is it at least 100%? (c) How does this differ from the SLR the SM describes?</p>`,
    a: tbl([['Item', 'Working', '₹ crore'], ['Stable retail outflow', '30,000 × 5%', '1,500'], ['Less-stable retail outflow', '20,000 × 10%', '2,000'], ['Wholesale outflow', '25,000 × 40%', '10,000'], ['Total outflows', '', '13,500'], ['Net outflows', '13,500 − 4,500', '9,000']]) + `<p><strong>LCR = 8,100 ÷ 9,000 = 90%.</strong> Below 100%, a shortfall of ₹900 crore of HQLA.</p><p><strong>Difference from SLR:</strong> SLR is a <em>flat percentage of DTL</em> held in approved liquid assets regardless of how fragile the funding is. LCR is <em>stress-based</em>: the same HQLA can be enough for a bank with sticky retail deposits and too little for one with flighty wholesale funding. <em>Beyond the SM; run-off rates here are illustrative, check RBI's current LCR rules.</em></p>`,
    trap: `<p>Dividing HQLA by total outflows instead of <em>net</em> outflows.</p>`,
    nums: [['Net cash outflows', 9000, '₹ crore'], ['LCR', 90, '%'], ['HQLA shortfall', 900, '₹ crore']],
  },
  {
    id: 'CF4', k: 'cfa', v: 'Numerical', src: CFA + ' · asset-quality ratios', links: ['bank-npa-class', 'nbfc-provisioning'],
    q: `<p>An analyst has these figures (₹ crore): gross advances 50,000; gross NPAs 2,500; provisions held against NPAs 1,500; standard-asset provision 200 (shown separately as a contingent provision). Compute the gross NPA ratio, net NPA, net NPA ratio and provision coverage ratio. Should the standard-asset provision be netted?</p>`,
    a: tbl([['Measure', 'Working', 'Result'], ['Gross NPA ratio', '2,500 ÷ 50,000', '5.00%'], ['Net NPA', '2,500 − 1,500', '1,000'], ['Net advances', '50,000 − 1,500', '48,500'], ['Net NPA ratio', '1,000 ÷ 48,500', '2.06%'], ['Provision coverage ratio', '1,500 ÷ 2,500', '60%']]) + `<p><strong>Standard-asset provision:</strong> no. It is shown separately and is never netted from gross advances nor reckoned in net-NPA arithmetic (the SM's NBFC provisioning rule). Netting it would understate net NPAs.</p>`,
    trap: `<p>Using gross advances as the denominator of the net NPA ratio. Net NPA ratio uses <em>net</em> advances.</p>`,
    nums: [['Gross NPA ratio', 5, '%'], ['Net NPA', 1000, '₹ crore'], ['Net NPA ratio', 2.06, '%'], ['Provision coverage ratio', 60, '%']],
  },
  {
    id: 'CF5', k: 'cfa', v: 'Numerical', src: CFA + ' · margin effect of an NPA', links: ['bank-npa-income'],
    q: `<p>A bank earned interest income of ₹6,000 crore and incurred interest expense of ₹3,600 crore on average earning assets of ₹40,000 crore. Included in income is ₹90 crore accrued on a ₹1,000 crore loan (12% for 9 months) that has just become an NPA with nothing realised. Compute the net interest margin (NIM) before and after the required treatment. Assume earning assets are unchanged.</p>`,
    a: `<p><strong>Before:</strong> (6,000 − 3,600) ÷ 40,000 = <strong>6.00%</strong>.</p><p><strong>Treatment:</strong> on an NPA, interest is recognised only on realisation; the ₹90 crore credited but unrealised is <strong>reversed</strong>.</p><p><strong>After:</strong> (6,000 − 90 − 3,600) ÷ 40,000 = 2,310 ÷ 40,000 = <strong>5.775%</strong>. One bad loan costs about 0.23 percentage points of margin, and the NPA also stops earning from here on.</p>`,
    trap: `<p>Leaving the accrued interest in income because it was "earned". On an NPA it is reversed.</p>`,
    nums: [['NIM before', 6, '%'], ['NIM after reversal', 5.775, '%', 0.01]],
  },
  {
    id: 'CF6', k: 'cfa', v: 'Theory', src: CFA + ' · why scale-based regulation', links: ['nbfc-layers', 'nbfc-vs-bank'],
    q: `<p>A bank and a non-deposit NBFC have the same loan book and similar profitability. The NBFC funds itself with market borrowings and commercial paper. An analyst asks why RBI regulates large NBFCs more heavily than small ones and why NBFCs are still treated differently from banks. Discuss with reference to funding risk, interconnectedness and regulatory arbitrage.</p>`,
    a: `<p><strong>Funding risk:</strong> an NBFC has no insured retail deposits (no DICGC) and no access to demand deposits, so it depends on market funding that can disappear in stress. A run on its paper can force asset sales.</p><p><strong>Interconnectedness:</strong> large NBFCs borrow from banks and mutual funds and lend to many borrowers; failure of one transmits to the rest. That is why the <strong>Upper Layer</strong> (top 10 by size plus RBI's scoring) faces tougher norms, and a <strong>Top Layer</strong> exists for the case where systemic risk rises sharply.</p><p><strong>Regulatory arbitrage:</strong> when banks face CRR/SLR and 9% CRAR while NBFCs do not, lending can migrate to the lighter-regulated entity. Scale-based regulation (from 1 October 2022) narrows the gap as size and activity grow, while keeping Base Layer compliance light.</p><p><strong>Still different from banks:</strong> no demand deposits, no payment-system role, no DICGC, no CRR/SLR, no priority-sector target. The NBFC capital bar (15%, Tier I 10%) is higher than the bank's 9% partly to compensate for the missing liquidity backstop.</p><p><em>The last sentence is an interpretation, not an SM statement.</em></p>`,
    trap: `<p>Saying NBFCs are "unregulated". They are regulated by RBI under Chapter IIIB; what differs is the form.</p>`,
  },
  {
    id: 'CF7', k: 'cfa', v: 'Theory', src: CFA + ' · reading audit findings like an analyst', links: ['bank-lfar', 'bank-npa-class'],
    q: `<p>An analyst reading a bank's annual report notes these audit findings: (i) several accounts were regularised just before the balance-sheet date out of fresh bank funding; (ii) limits were repeatedly renewed for short ad hoc periods; (iii) the LFAR records title deeds held at a different office; (iv) concurrent audit flagged revenue leakage in interest calculations. Explain what each tells the analyst about asset quality, controls and earnings, and what the auditor should have tested.</p>`,
    a: `<p><strong>(i) Evergreening risk (asset quality):</strong> regularising from fresh funding hides weakness. The auditor must test whether repayment came from <strong>genuine sources</strong> and whether the inherent weakness persists, before accepting a standard classification (bank-npa-class).</p><p><strong>(ii) Dodging the 180-day rule (asset quality):</strong> repeated ad hoc or short reviews can be used to avoid classifying an account whose limit has not been reviewed within <strong>180 days</strong> as an NPA. Test review dates, not only sanction letters.</p><p><strong>(iii) Control weakness (security):</strong> title deeds elsewhere means the bank may not be able to enforce its security. This is the kind of branch-level item the LFAR records specifically.</p><p><strong>(iv) Earnings quality:</strong> revenue leakage means interest, discount, commission or exchange was under-charged; concurrent audit percentage-checks these calculations. Analyst effect: reported margin understates earning power, but the control failure is a warning.</p>`,
    trap: `<p>Treating regularisation near year end as proof of recovery without checking the source of funds.</p>`,
  },
  {
    id: 'CF8', k: 'cfa', v: 'Numerical', src: CFA + ' · quality of Tier 1', links: ['nbfc-capital'],
    q: `<p>Two gold-loan NBFC-BLs each have RWA ₹1,000 crore. Lender A reports Tier I of ₹130 crore, which includes ₹25 crore of perpetual debt instruments. Lender B reports Tier I of ₹118 crore with no perpetual debt. Reported, A looks stronger. After the NBFC-BL rule on perpetual debt, compare their Tier I ratios with the 12% gold-loan floor.</p>`,
    a: tbl([['', 'Lender A', 'Lender B'], ['Reported Tier I', '130', '118'], ['Reported ratio', '13.0%', '11.8%'], ['Perpetual debt (NBFC-BL cannot count)', '− 25', '0'], ['Adjusted Tier I', '105', '118'], ['Adjusted ratio', '10.5%', '11.8%'], ['12% floor = 120', 'Short by 15', 'Short by 2']]) + `<p><strong>Conclusion:</strong> the ranking reverses. B has higher quality capital; <strong>neither</strong> meets the 12% gold-loan floor. Always adjust reported Tier I for instruments the category cannot count.</p>`,
    trap: `<p>Ranking lenders on reported Tier I. Quality of capital matters, not just the headline number.</p>`,
    nums: [['Lender A adjusted Tier I ratio', 10.5, '%'], ['Lender B adjusted Tier I ratio', 11.8, '%'], ['Lender A shortfall to 12% floor', 15, '₹ crore'], ['Lender B shortfall to 12% floor', 2, '₹ crore']],
  },

  // ---------------- built from one line of the SM ----------------
  {
    id: 'LN1', k: 'line', v: 'Numerical', src: LN + ' · FCNR interest', links: ['bank-deposits'],
    q: `<p>One line in the SM says FCNR interest is calculated on a 360-day year and converted to rupees at the head-office notified rate, with the gain or loss taken to P&amp;L. A bank holds an FCNR fixed deposit of US$ 50,000 at 2% p.a. Interest for 90 days is due. The HO notified rate is ₹84 per US$. Compute the interest in US$ and ₹, and state what an auditor checks.</p>`,
    a: `<p>Interest = 50,000 × 2% × 90 ÷ 360 = <strong>US$ 250</strong>. In rupees: 250 × 84 = <strong>₹21,000</strong>.</p><p>Auditor checks: the day-count is <strong>360</strong>, not 365; the rate used is the HO-notified rate; and the exchange difference is routed to the profit and loss account.</p>`,
    trap: `<p>Using 365 days. That gives US$ 246.58 and a wrong ₹ figure.</p>`,
    nums: [['Interest', 250, 'US$'], ['Interest in ₹', 21000, '₹']],
  },
  {
    id: 'LN2', k: 'line', v: 'Theory', src: LN + ' · inoperative accounts', links: ['bank-deposits'],
    q: `<p>The SM says an account with no transactions for over 2 years is inoperative, and that a significant balance drop compared with last year warrants checking authorisation. At year end an account inoperative for 3 years was revived on 20 March and ₹8 lakh was withdrawn from a balance of ₹8.5 lakh the same week. What will you check and what could it indicate?</p>`,
    a: `<p><strong>Rule:</strong> inoperative status (no transaction for over 2 years); revival needs proper authority; a large fall in balance needs the withdrawal authorisation checked.</p><p><strong>Checks:</strong> who authorised revival and on what documents (KYC, signature verification); whether the withdrawal was by the account holder or a mandated person; whether the cheque or form, signatures and identity were verified; how branch staff handled the dormant-account safeguards; confirmation from the customer.</p><p><strong>Could indicate:</strong> fraud or misappropriation of dormant balances by insiders. If suspected, evaluate reporting duties (s.143(12), RBI).</p>`,
    trap: `<p>Treating the withdrawal as routine because the balance was the customer's own.</p>`,
  },
  {
    id: 'LN3', k: 'line', v: 'Theory', src: LN + ' · bulk deposit threshold', links: ['bank-deposits'],
    q: `<p>The SM mentions bulk deposits of ₹2 crore and above for scheduled commercial banks. A branch accepted a ₹1.8 crore term deposit at the higher bulk rate, and a ₹3 crore deposit was closed before maturity with no penalty deducted. Comment.</p>`,
    a: `<p><strong>₹1.8 crore:</strong> below the ₹2 crore bulk threshold, so the bulk (higher) rate was not available; interest paid in excess is a revenue leak and a control lapse.</p><p><strong>₹3 crore:</strong> a bulk deposit, so the correct rate at acceptance should have been the bulk rate; premature closure requires the <strong>foreclosure penalty</strong> to be deducted. Not deducting it understates income.</p><p><strong>Auditor action:</strong> recompute interest on both, quantify the excess/short, and report as an internal-control weakness; consider adjusting the financial statements if material.</p>`,
    trap: `<p>Accepting the rate because it was approved at the branch. The threshold decides the rate.</p>`,
  },
  {
    id: 'LN4', k: 'line', v: 'Numerical', src: LN + ' · unbooked deposit interest in DTL', links: ['bank-dtl'],
    q: `<p>The SM says interest accrued on deposits is part of DTL whether or not booked. Term deposits are ₹3,650 crore at 6% p.a.; interest has accrued for 45 days since it was last paid and is not yet booked. Compute the accrued interest (365-day year) and the extra CRR if CRR is 4%.</p>`,
    a: `<p>Accrued interest = 3,650 × 6% × 45 ÷ 365 = 3,650 ÷ 365 = 10; 10 × 6% × 45 = <strong>₹27 crore</strong>.</p><p>This is added to DTL (even though unbooked), so extra CRR = 27 × 4% = <strong>₹1.08 crore</strong>.</p>`,
    trap: `<p>Ignoring the accrual because the books do not show it.</p>`,
    nums: [['Accrued interest', 27, '₹ crore'], ['Extra CRR', 1.08, '₹ crore', 0.01]],
  },
  {
    id: 'LN5', k: 'line', v: 'Theory', src: LN + ' · cashier and ledger', links: ['bank-ic-cash'],
    q: `<p>The SM says a cashier must have no access to the customer ledger or day book. Short of staff, a branch lets the cashier post the savings ledger "just for lunch hours". Cash shortages have been small but frequent. Advise the SCA on risk and on what to report.</p>`,
    a: `<p><strong>Risk:</strong> a person who can both handle cash and alter the ledger can conceal misappropriation; small repeated shortages are a typical fingerprint of such concealment.</p><p><strong>Rule:</strong> segregate custody of cash from record-keeping. Cash should be in joint custody of two officers and agreed to the day book daily by someone independent.</p><p><strong>Actions:</strong> extend substantive tests on cash and customer accounts for the period; check ledger postings by the cashier; recommend withdrawing ledger access; include the lapse in the LFAR/internal-control report; if fraud is suspected, follow the fraud-reporting route.</p>`,
    trap: `<p>Writing "staff shortage" as a mitigating factor. It explains the lapse; it does not cure the control weakness.</p>`,
  },
  {
    id: 'LN6', k: 'line', v: 'Numerical', src: LN + ' · ROU assets in NBFC risk weights', links: ['nbfc-capital', 'bank-scope-2026'],
    q: `<p>The May 2026 update says right-of-use (ROU) assets sit in the "Others" line of the NBFC risk-weight table at 100%. A general NBFC has Tier I ₹100 crore, Tier II ₹50 crore and RWA ₹900 crore excluding ₹40 crore of ROU assets. Compute the capital ratio before and after adding the ROU assets, and comment on compliance with 15%.</p>`,
    a: `<p>Before: 150 ÷ 900 = <strong>16.67%</strong>. ROU assets 40 × 100% = 40 added: RWA = 940. After: 150 ÷ 940 = <strong>15.96%</strong>.</p><p>Still above 15% (and Tier I 100 ÷ 940 = 10.64%, above 10%), so compliant, but the cushion has shrunk by about 0.7 points. Excluding the ROU assets would overstate the ratio.</p>`,
    trap: `<p>Treating ROU assets as zero-risk because they are leases, not loans.</p>`,
    nums: [['Ratio before', 16.67, '%'], ['Ratio after', 15.96, '%']],
  },
  {
    id: 'LN7', k: 'line', v: 'Numerical', src: LN + ' · standard-asset provision and net NPA', links: ['nbfc-provisioning'],
    q: `<p>The SM says the standard-asset provision is shown separately and never reckoned in net-NPA arithmetic. An NBFC has gross advances ₹8,000 crore, NPAs ₹400 crore, provisions against NPAs ₹150 crore and a contingent provision against standard assets of ₹20 crore. Compute net NPA and the net NPA ratio.</p>`,
    a: `<p>Net NPA = 400 − 150 = <strong>₹250 crore</strong> (the ₹20 crore standard-asset provision is ignored).</p><p>Net NPA ratio = 250 ÷ (8,000 − 150) = 250 ÷ 7,850 = <strong>3.18%</strong>.</p>`,
    trap: `<p>Deducting the standard-asset provision as well, giving 230 and a lower ratio.</p>`,
    nums: [['Net NPA', 250, '₹ crore'], ['Net NPA ratio', 3.18, '%']],
  },
  {
    id: 'LN8', k: 'line', v: 'Theory', src: LN + ' · Central vs State guarantee', links: ['bank-npa-class'],
    q: `<p>The SM says a Central Government guaranteed advance is NPA only after the guarantee is invoked and repudiated, but not so for State guarantees. A bank has two advances, each overdue 120 days: A guaranteed by the Central Government (guarantee not yet invoked) and B guaranteed by a State Government. Classify each, and deal with interest income.</p>`,
    a: `<p><strong>Account A (Central guarantee):</strong> not classified NPA merely because it is overdue; classification waits until the guarantee is invoked and repudiated.</p><p><strong>Account B (State guarantee):</strong> follows the ordinary rule: overdue for more than 90 days means <strong>NPA</strong>.</p><p><strong>Income on both:</strong> for income recognition, the guarantee does not help; interest is not taken to income unless realised.</p>`,
    trap: `<p>Treating both guarantees alike. The carve-out is only for Central Government guarantees.</p>`,
  },
  {
    id: 'LN9', k: 'line', v: 'Theory', src: LN + ' · bank receipts and SGL', links: ['bank-va-invest'],
    q: `<p>The SM says bank receipts (BRs) cannot be issued for government-securities deals where the SGL facility is available. At year end the bank holds BRs from a counterparty for ₹40 crore of G-secs bought two years ago, still not converted into SGL delivery. What does the auditor do?</p>`,
    a: `<p><strong>Issue:</strong> BRs for G-sec deals where SGL is available are not permitted, and a BR outstanding two years is a long-outstanding BR.</p><p><strong>Procedures:</strong> obtain <strong>counterparty confirmation</strong> of the BR; investigate why it is outstanding and whether the securities exist and are owned by the bank (existence and ownership); agree to SGL/depository statements; check valuation per RBI norms; report as a compliance and control lapse.</p><p><strong>If unconfirmed:</strong> the ₹40 crore may not exist as an asset; consider qualification.</p>`,
    trap: `<p>Accepting the BR as evidence of the securities themselves. A BR is a receipt, not the security.</p>`,
  },
  {
    id: 'LN10', k: 'line', v: 'Numerical', src: LN + ' · Tier II composition', links: ['nbfc-capital'],
    q: `<p>The SM says revaluation reserves count in Tier II after a 55% discount, and general provisions up to 1.25% of RWA. A general NBFC (not BL) has revaluation reserves ₹100 crore, general provisions ₹40 crore, subordinated debt ₹30 crore, RWA ₹2,000 crore and Tier I ₹120 crore. Compute eligible Tier II and check the cap.</p>`,
    a: tbl([['Component', 'Working', '₹ crore'], ['Revaluation reserves', '100 × (1 − 55%)', '45'], ['General provisions', 'cap 1.25% × 2,000 = 25; held 40, so 25', '25'], ['Subordinated debt', '', '30'], ['Total Tier II', '45 + 25 + 30', '100']]) + `<p><strong>Cap:</strong> Tier II (100) does not exceed Tier I (120), so the full amount counts.</p>`,
    trap: `<p>Counting the full ₹40 crore of general provisions, or ignoring the revaluation discount.</p>`,
    nums: [['Revaluation reserve counted', 45, '₹ crore'], ['General provisions counted', 25, '₹ crore'], ['Eligible Tier II', 100, '₹ crore']],
  },
  {
    id: 'LN11', k: 'line', v: 'Numerical', src: LN + ' · perpetual debt cap', links: ['nbfc-capital'],
    q: `<p>The SM caps perpetual debt in Tier I at 15% of the prior year's aggregate Tier I, with the excess going to Tier II. A general NBFC (not BL) had prior-year Tier I of ₹200 crore and has perpetual debt of ₹50 crore. How much counts in Tier I and how much is pushed to Tier II?</p>`,
    a: `<p>Cap = 15% × 200 = <strong>₹30 crore</strong> in Tier I. Excess = 50 − 30 = <strong>₹20 crore</strong>, counted in Tier II (subject to the Tier II ≤ Tier I limit). For an NBFC-BL, the whole ₹50 crore would be excluded from both tiers.</p>`,
    trap: `<p>Applying the 15% to current-year Tier I. The cap uses the prior year's aggregate Tier I.</p>`,
    nums: [['Perpetual debt in Tier I', 30, '₹ crore'], ['Excess to Tier II', 20, '₹ crore']],
  },
  {
    id: 'LN12', k: 'line', v: 'Theory', src: LN + ' · Statutory Auditor\'s Certificate timing', links: ['nbfc-report-board'],
    q: `<p>The SM says the Statutory Auditor's Certificate reaches RBI within 5 working days of signing the audit report, but not later than 31 December. An NBFC auditor signs the audit report on Friday 26 December 2025. By when must the certificate reach the DNBS regional office?</p>`,
    a: `<p>Five working days after 26 December would fall on or about 2 January 2026 (working days: 29, 30, 31 December, 1 and 2 January, ignoring local holidays). The outer limit is <strong>31 December 2025</strong>, which is earlier, so the certificate must reach RBI <strong>by 31 December 2025</strong>.</p><p>Principle: both limits apply; the earlier binds.</p>`,
    trap: `<p>Counting only the five working days. The 31 December ceiling can bite when the report is signed late in the year.</p>`,
  },
];
