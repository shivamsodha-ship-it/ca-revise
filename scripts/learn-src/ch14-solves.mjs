// Step solvers for Chapter 14. Round numbers on purpose: every step can be done in the head.
// ans/tol are checked in scripts/build-learn.mjs against a recomputation before the file is written.
const num = (ask, ans, unit, say, note, tol) => ({ kind: 'num', ask, ans, unit, say, note, ...(tol !== undefined ? { tol } : {}) });
const pick = (ask, opts, pickIx, say, note) => ({ kind: 'pick', ask, opts, pickIx, say, note });

export default [
  {
    id: 's-dtl', title: 'DTL, then CRR and SLR', p: 'bank-dtl',
    tip: 'Split the list into two piles first: "owners and central bank" (out) and "public and unbooked" (in). Then move the decimal: 4% of 1,550 is 1,550 ÷ 100 × 4.',
    variants: [
      {
        label: 'Base case',
        q: `<p>A bank\'s liabilities (₹ crore): deposits 1,400; other liabilities 100; loans from RBI 100; paid-up capital 60; reserves 240; credit balance in P&amp;L 20; net income-tax provision 30. Total reported: <strong>1,950</strong>. Not yet booked: interest accrued on deposits <strong>10</strong>. Net <strong>credit</strong> balance in branch adjustment accounts <strong>40</strong> (not in the 1,950). Assume CRR 4% and SLR 18% for this question.</p>`,
        steps: [
          num('Which items come OUT? Add RBI loan, capital, reserves, P&L credit and tax provision (₹ crore).', 450, '₹ crore', '100 + 60 + 240 + 20 + 30 = <strong>450</strong>. Owners\' funds and central-bank money are excluded.', 'Excluded 100+60+240+20+30 = 450'),
          num('Reported 1,950 less the excluded items (₹ crore).', 1500, '₹ crore', '1,950 − 450 = <strong>1,500</strong>.', '1,950 − 450 = 1,500'),
          num('Add unbooked deposit interest and net credit in branch adjustment accounts. DTL (₹ crore)?', 1550, '₹ crore', '1,500 + 10 + 40 = <strong>1,550</strong>. Both are included even if not booked.', 'DTL = 1,500 + 10 + 40 = 1,550'),
          num('CRR at 4% of DTL (₹ crore).', 62, '₹ crore', '1,550 ÷ 100 × 4 = <strong>62</strong>.', 'CRR 4% = 62'),
          num('SLR at 18% of DTL (₹ crore).', 279, '₹ crore', '1,550 × 18% = 155 + 124 = <strong>279</strong> (10% = 155, 8% = 124).', 'SLR 18% = 279'),
        ],
      },
      {
        label: 'Twist 1: net debit',
        q: `<p>Same bank, but the branch adjustment accounts show a net <strong>debit</strong> balance of 40 instead of a credit. Everything else is the same (CRR 4%, SLR 18%).</p>`,
        steps: [
          pick('How does the net debit balance affect DTL?', ['Add 40', 'Deduct 40', 'Add nothing: only a net credit is included'], 2, 'Only a <strong>net credit</strong> balance is included. A net debit adds nothing.', 'Net debit: add nothing'),
          num('DTL (₹ crore).', 1510, '₹ crore', '1,500 + 10 (interest) + 0 = <strong>1,510</strong>.', 'DTL = 1,500 + 10 = 1,510'),
          num('CRR at 4% (₹ crore).', 60.4, '₹ crore', '1,510 × 4% = <strong>60.4</strong>.', 'CRR = 60.4', 0.05),
          num('SLR at 18% (₹ crore).', 271.8, '₹ crore', '1,510 × 18% = 151 + 120.8 = <strong>271.8</strong>.', 'SLR = 271.8', 0.1),
        ],
      },
      {
        label: 'Twist 2: foreign borrowing',
        q: `<p>Back to the base case (net credit 40), but the bank also has <strong>borrowings from an overseas bank of 100</strong>, not in the 1,950. CRR 4%, SLR 18%.</p>`,
        steps: [
          pick('Are borrowings from abroad included in DTL?', ['Yes, at gross', 'No', 'Only the net amount'], 0, 'Borrowings from abroad are included <strong>at gross</strong>.', 'Foreign borrowing added at gross 100'),
          num('DTL (₹ crore).', 1650, '₹ crore', '1,550 + 100 = <strong>1,650</strong>.', 'DTL = 1,550 + 100 = 1,650'),
          num('CRR at 4% (₹ crore).', 66, '₹ crore', '1,650 × 4% = <strong>66</strong>.', 'CRR = 66'),
          num('SLR at 18% (₹ crore).', 297, '₹ crore', '1,650 × 18% = 165 + 132 = <strong>297</strong>.', 'SLR = 297'),
        ],
      },
    ],
  },
  {
    id: 's-dp', title: 'Drawing power', p: 'bank-drawing-power',
    tip: 'Do it as "keep" percentages: margin 25% means keep 75% (three quarters). Margin 40% means keep 60% (three fifths). Clean the base first, then multiply once.',
    variants: [
      {
        label: 'Base case',
        q: `<p>Cash credit limit ₹600 lakh. Stock ₹500 lakh (of which ₹40 lakh damaged). Debtors ₹400 lakh (of which ₹60 lakh are over 90 days). Creditors for stock ₹60 lakh. Margin: 25% on stock, 40% on debtors. Outstanding balance ₹520 lakh.</p>`,
        steps: [
          num('Net eligible stock (₹ lakh).', 400, '₹ lakh', '500 − 40 damaged − 60 creditors = <strong>400</strong>.', 'Stock 500−40−60 = 400'),
          num('Stock DP after 25% margin (₹ lakh).', 300, '₹ lakh', '400 × 75% = <strong>300</strong>.', 'Stock DP = 300'),
          num('Eligible debtors (₹ lakh).', 340, '₹ lakh', '400 − 60 over 90 days = <strong>340</strong>.', 'Debtors 400−60 = 340'),
          num('Debtors DP after 40% margin (₹ lakh).', 204, '₹ lakh', '340 × 60% = 200 + 4 = <strong>204</strong>.', 'Debtors DP = 204'),
          num('Total DP (₹ lakh).', 504, '₹ lakh', '300 + 204 = <strong>504</strong>. Limit 600 is higher, so DP governs.', 'DP = 504'),
          num('Outstanding 520 minus DP: excess (₹ lakh).', 16, '₹ lakh', '520 − 504 = <strong>16</strong> over DP: irregular; report it.', 'Excess over DP = 16'),
        ],
      },
      {
        label: 'Twist 1: limit binds',
        q: `<p>Same facts, but the sanctioned limit is only <strong>₹450 lakh</strong> and the outstanding is ₹460 lakh.</p>`,
        steps: [
          num('DP from the facts (₹ lakh).', 504, '₹ lakh', 'Same working as before: 300 + 204 = <strong>504</strong>.', 'DP = 504'),
          num('Maximum the account may draw: lower of DP and limit (₹ lakh).', 450, '₹ lakh', 'Lower of 504 and 450 = <strong>450</strong>.', 'Max draw = 450'),
          num('Outstanding 460: excess over the permitted amount (₹ lakh).', 10, '₹ lakh', '460 − 450 = <strong>10</strong> beyond the limit.', 'Excess = 10'),
        ],
      },
      {
        label: 'Twist 2: margin up',
        q: `<p>Same base facts (limit ₹600 lakh) but the bank raises the stock margin to <strong>30%</strong>. Debtor margin stays 40%.</p>`,
        steps: [
          num('Stock DP at 30% margin (₹ lakh).', 280, '₹ lakh', '400 × 70% = <strong>280</strong>.', 'Stock DP = 280'),
          num('Total DP with debtors DP 204 (₹ lakh).', 484, '₹ lakh', '280 + 204 = <strong>484</strong>.', 'DP = 484'),
          pick('Outstanding is ₹520 lakh. Is the account within DP?', ['Yes', 'No, ₹36 lakh over'], 1, '520 − 484 = <strong>36</strong> over DP.', 'Over DP by 36'),
        ],
      },
      {
        label: 'Twist 3: stale statement',
        q: `<p>Same base facts, but the stock statement used is dated <strong>5 months</strong> before the balance sheet date.</p>`,
        steps: [
          pick('Can the stale statement support DP?', ['Yes, the figures are the same', 'No: it must be no older than 3 months'], 1, 'The statement must be <strong>no older than 3 months</strong>; outstanding relying on an older one is irregular.', 'Statement 5 months old: irregular'),
          pick('If the account has also been out of order for more than 90 days, classification?', ['Standard', 'NPA'], 1, 'A temporary deficiency excuse needs both a fresh statement and not more than 90 days out of order. Over 90 days means <strong>NPA</strong>.', 'Out of order >90 days: NPA'),
        ],
      },
    ],
  },
  {
    id: 's-npa-days', title: 'Is it an NPA on 31 March?', p: 'bank-npa-class',
    tip: 'Count days by month ends: days left in the start month + full months. From 15 December: 16 + 31 + 28 + 31 = 106. Anything above 90 is an NPA; 61 to 90 is SMA-2 (early warning, still standard).',
    variants: [
      {
        label: 'Base case',
        q: `<p>A term loan instalment due on <strong>15 December 2025</strong> remains unpaid. Balance sheet date <strong>31 March 2026</strong>. (Days after due date; February has 28 days.)</p>`,
        steps: [
          num('Days overdue at 31 March 2026.', 106, 'days', 'December 15 to 31 = 16; January 31; February 28; March 31. 16 + 31 + 28 + 31 = <strong>106</strong>.', 'Overdue 106 days'),
          pick('Classification?', ['Standard', 'SMA-2', 'NPA (sub-standard)'], 2, 'More than 90 days: <strong>NPA</strong>, sub-standard to begin with.', 'More than 90: NPA'),
          pick('How is interest on this account treated from now?', ['Accrued monthly', 'Booked only on realisation; unrealised interest reversed'], 1, 'On an NPA, income is on <strong>realisation</strong>.', 'Interest on realisation'),
        ],
      },
      {
        label: 'Twist 1: later due date',
        q: `<p>Same loan, but the instalment fell due on <strong>15 January 2026</strong>.</p>`,
        steps: [
          num('Days overdue at 31 March 2026.', 75, 'days', 'January 15 to 31 = 16; February 28; March 31. 16 + 28 + 31 = <strong>75</strong>.', 'Overdue 75 days'),
          pick('Classification?', ['Standard (SMA-2, 61 to 90 days)', 'NPA'], 0, '75 days is not more than 90: still <strong>standard</strong>, but in the SMA-2 early-warning band, so the auditor examines it.', 'Standard but SMA-2'),
        ],
      },
      {
        label: 'Twist 2: other facility',
        q: `<p>The borrower has a term loan (instalment due 15 December 2025, unpaid) and a cash credit account which is fully regular.</p>`,
        steps: [
          pick('Classification of the regular cash credit account?', ['Standard, it is regular', 'NPA, classification is borrower-wise'], 1, 'Classification is <strong>borrower-wise</strong>, so all facilities become NPA.', 'Borrower-wise: CC also NPA'),
        ],
      },
    ],
  },
  {
    id: 's-nbfc-prov', title: 'NBFC provision: the layer twist', p: 'nbfc-provisioning',
    tip: 'Ask three questions in order: which layer (12 or 18 months)? How long as NPA? Then split the loan into secured and unsecured. Unsecured is always 100%. Compute in crore with round numbers.',
    variants: [
      {
        label: 'Base case',
        q: `<p>An NBFC in the <strong>Middle Layer</strong> has a loan of <strong>₹5 crore</strong> that has been NPA for <strong>14 months</strong>. Realisable value of security: <strong>₹3 crore</strong>.</p>`,
        steps: [
          pick('Category?', ['Sub-standard', 'Doubtful', 'Loss'], 1, 'Middle Layer: 12 months as NPA then doubtful. 14 months means <strong>doubtful</strong>.', 'ML, 14 months: doubtful'),
          num('For how many months has it been doubtful?', 2, 'months', '14 − 12 = <strong>2 months</strong>, which is under 1 year, so the 20% band applies to the secured part.', 'Doubtful for 2 months (<1 yr)'),
          num('Unsecured portion (₹ crore).', 2, '₹ crore', '5 − 3 = <strong>2</strong>.', 'Unsecured 5−3 = 2'),
          num('Provision on the unsecured portion (₹ crore).', 2, '₹ crore', '100% × 2 = <strong>2.0</strong>.', 'Unsecured 100% = 2.0'),
          num('Provision on the secured portion at 20% (₹ crore).', 0.6, '₹ crore', '3 × 20% = <strong>0.6</strong>.', 'Secured 20% = 0.6', 0.001),
          num('Total provision (₹ crore).', 2.6, '₹ crore', '2.0 + 0.6 = <strong>2.6</strong>.', 'Total = 2.6', 0.001),
        ],
      },
      {
        label: 'Twist 1: Base Layer',
        q: `<p>Same loan, but the NBFC is in the <strong>Base Layer</strong>.</p>`,
        steps: [
          pick('Category with 14 months as NPA?', ['Sub-standard (under 18 months)', 'Doubtful'], 0, 'Base Layer: 18 months as sub-standard. 14 months is still <strong>sub-standard</strong>.', 'BL, 14 months: sub-standard'),
          num('Provision (₹ crore).', 0.5, '₹ crore', '10% flat on the whole outstanding: 5 × 10% = <strong>0.5</strong>.', 'SS 10% of 5 = 0.5', 0.001),
        ],
      },
      {
        label: 'Twist 2: old doubtful',
        q: `<p>Middle Layer NBFC, same ₹5 crore loan and ₹3 crore security, but the loan has been NPA for <strong>5 years</strong> (60 months).</p>`,
        steps: [
          num('Years as doubtful (60 months less the first 12).', 4, 'years', '60 − 12 = 48 months = <strong>4 years</strong>, which is over 3 years.', 'Doubtful 4 yrs (>3)'),
          num('Provision on the secured portion at 50% (₹ crore).', 1.5, '₹ crore', '3 × 50% = <strong>1.5</strong>.', 'Secured 50% = 1.5', 0.001),
          num('Total provision with the unsecured 2.0 (₹ crore).', 3.5, '₹ crore', '2.0 + 1.5 = <strong>3.5</strong>.', 'Total = 3.5', 0.001),
        ],
      },
    ],
  },
  {
    id: 's-nbfc-capital', title: 'NBFC capital ratios', p: 'nbfc-capital',
    tip: 'Make RWA 1,000 in your head and read every percentage as "tenths of a hundred": Tier I of 100 is 10%, total of 155 is 15.5%. The comparison is then instant.',
    variants: [
      {
        label: 'Base case',
        q: `<p>A general NBFC (not gold-loan) has Tier I capital <strong>₹100 crore</strong>, Tier II <strong>₹55 crore</strong>, risk-weighted assets <strong>₹1,000 crore</strong>.</p>`,
        steps: [
          num('Tier I ratio (%).', 10, '%', '100 ÷ 1,000 = <strong>10%</strong>: just meets the 10% minimum.', 'Tier I = 10%'),
          num('Total capital ratio (%).', 15.5, '%', '(100 + 55) ÷ 1,000 = <strong>15.5%</strong>.', 'Total = 15.5%', 0.01),
          pick('Compliant?', ['Yes', 'No'], 0, '10% ≥ 10% and 15.5% ≥ 15%. Also Tier II (55) does not exceed Tier I (100). <strong>Compliant.</strong>', 'Compliant'),
        ],
      },
      {
        label: 'Twist 1: Tier II falls',
        q: `<p>Same, but Tier II is only <strong>₹45 crore</strong>.</p>`,
        steps: [
          num('Total capital ratio (%).', 14.5, '%', '(100 + 45) ÷ 1,000 = <strong>14.5%</strong>.', 'Total = 14.5%', 0.01),
          pick('Compliant?', ['Yes, Tier I is 10%', 'No, total is below 15%'], 1, 'Total 14.5% is below the 15% minimum: <strong>non-compliant</strong>, even though Tier I passes.', 'Non-compliant (total <15%)'),
          num('Capital shortfall to reach 15% (₹ crore).', 5, '₹ crore', '15% of 1,000 = 150; capital is 145; shortfall <strong>5</strong>.', 'Shortfall = 5'),
        ],
      },
      {
        label: 'Twist 2: gold-loan NBFC',
        q: `<p>Same base numbers (Tier I 100, Tier II 55, RWA 1,000) but the NBFC lends mainly against gold (more than 50% of financial assets).</p>`,
        steps: [
          num('Minimum Tier I at 12% (₹ crore).', 120, '₹ crore', '12% × 1,000 = <strong>120</strong>.', 'Required Tier I = 120'),
          pick('Compliant?', ['Yes: total ratio 15.5%', 'No: Tier I 100 is below 120'], 1, 'The gold-loan floor is on <strong>Tier I</strong>: 100 &lt; 120. <strong>Non-compliant</strong>.', 'Non-compliant (Tier I <12%)'),
          num('Tier I shortfall (₹ crore).', 20, '₹ crore', '120 − 100 = <strong>20</strong>.', 'Tier I shortfall = 20'),
        ],
      },
      {
        label: 'Twist 3: perpetual debt',
        q: `<p>Gold-loan NBFC-<strong>BL</strong>, RWA ₹1,000 crore, reported Tier I ₹130 crore, which includes <strong>₹25 crore of perpetual debt instruments</strong>.</p>`,
        steps: [
          pick('Can an NBFC-BL count perpetual debt in Tier I?', ['Yes', 'No'], 1, 'NBFC-BL cannot include perpetual debt instruments in Tier I (or Tier II).', 'Perpetual debt excluded'),
          num('Tier I after exclusion (₹ crore).', 105, '₹ crore', '130 − 25 = <strong>105</strong>.', 'Tier I = 105'),
          num('Shortfall against the 12% floor of 120 (₹ crore).', 15, '₹ crore', '120 − 105 = <strong>15</strong>. Non-compliant.', 'Shortfall = 15'),
        ],
      },
    ],
  },
  {
    id: 's-bank-crar', title: 'Bank CRAR with risk weights', p: 'bank-capital-crar',
    tip: 'Weights first, then add. 0% items vanish; halve the 50% items; keep the 100% items. Bank minimum is 9%, so for RWA 400 you need capital of 36.',
    variants: [
      {
        label: 'Base case',
        q: `<p>A bank (₹ crore): cash 100 (0%); government securities 400 (0%); secured housing loans, each up to ₹75 lakh, 300 (50%); corporate loans 200 (100%); off-balance-sheet items, credit equivalent 50 (100%). Capital: Tier I 30, Tier II 6.</p>`,
        steps: [
          num('Risk-weighted value of the housing loans (₹ crore).', 150, '₹ crore', '300 × 50% = <strong>150</strong>.', 'Housing 300×50% = 150'),
          num('Total RWA including corporate loans 200 and off-balance-sheet 50 (₹ crore).', 400, '₹ crore', '0 + 0 + 150 + 200 + 50 = <strong>400</strong>.', 'RWA = 400'),
          num('CRAR (%).', 9, '%', '(30 + 6) ÷ 400 = <strong>9%</strong>.', 'CRAR = 9%'),
          pick('Against the 9% minimum?', ['Compliant, exactly at the minimum', 'Non-compliant'], 0, '9% meets the 9% minimum, with no cushion.', 'Meets 9% minimum'),
        ],
      },
      {
        label: 'Twist: larger housing loans',
        q: `<p>Same bank, but all the housing loans are above ₹75 lakh each (weight 75%).</p>`,
        steps: [
          num('Risk-weighted housing loans (₹ crore).', 225, '₹ crore', '300 × 75% = <strong>225</strong>.', 'Housing 300×75% = 225'),
          num('New total RWA (₹ crore).', 475, '₹ crore', '225 + 200 + 50 = <strong>475</strong>.', 'RWA = 475'),
          num('CRAR (%).', 7.58, '%', '36 ÷ 475 = <strong>7.58%</strong> (475 × 7.5% = 35.6, so a little above 7.5).', 'CRAR = 7.58%', 0.02),
          num('Extra capital needed to reach 9% (₹ crore).', 6.75, '₹ crore', '9% × 475 = 42.75; capital 36; need <strong>6.75</strong> more.', 'Need 42.75 − 36 = 6.75', 0.02),
        ],
      },
    ],
  },
  {
    id: 's-business-test', title: 'Is it an NBFC? The 50-50 test', p: 'nbfc-def',
    tip: 'Net the intangibles from total assets first. Then ask: is the fraction above one half? Compare by doubling the numerator: if 2 × financial assets is more than the denominator, the test is passed.',
    variants: [
      {
        label: 'Base case',
        q: `<p>Total assets ₹600 crore, intangible assets ₹100 crore, financial assets ₹300 crore. Gross income ₹100 crore, of which income from financial assets ₹54 crore.</p>`,
        steps: [
          num('Total assets net of intangibles (₹ crore).', 500, '₹ crore', '600 − 100 = <strong>500</strong>.', 'Net assets = 500'),
          num('Financial assets as % of net total assets.', 60, '%', '300 ÷ 500 = <strong>60%</strong>.', 'Asset test 60%'),
          num('Financial income as % of gross income.', 54, '%', '54 ÷ 100 = <strong>54%</strong>.', 'Income test 54%'),
          pick('Principal business criteria met?', ['Yes, both above 50%', 'No'], 0, 'Both limbs exceed 50%: it qualifies as an NBFC and can apply under s.45-IA.', 'Both >50%: NBFC'),
        ],
      },
      {
        label: 'Twist 1: income falls',
        q: `<p>Same company, but income from financial assets is only <strong>₹45 crore</strong> of ₹100 crore gross income.</p>`,
        steps: [
          num('Financial income as % of gross income.', 45, '%', '45 ÷ 100 = <strong>45%</strong>.', 'Income test 45%'),
          pick('Qualifies as an NBFC?', ['Yes, assets are 60%', 'No, the income limb fails'], 1, 'Both limbs must pass. <strong>Not an NBFC</strong> on these figures.', 'Income limb fails'),
        ],
      },
      {
        label: 'Twist 2: exactly 50%',
        q: `<p>Total assets ₹600 crore, intangibles ₹80 crore, financial assets ₹260 crore. Financial income is 60% of gross income.</p>`,
        steps: [
          num('Net total assets (₹ crore).', 520, '₹ crore', '600 − 80 = <strong>520</strong>.', 'Net assets = 520'),
          num('Financial assets as % of net total assets.', 50, '%', '260 ÷ 520 = <strong>50%</strong> exactly.', 'Asset test exactly 50%'),
          pick('Asset limb passed?', ['Yes', 'No: the rule needs more than 50%'], 1, 'The rule says "exceeds 50%". Exactly 50% <strong>fails</strong>.', 'Exactly 50% fails'),
        ],
      },
    ],
  },
  {
    id: 's-npa-sale', title: 'Selling an NPA', p: 'bank-npa-saleshop',
    tip: 'Eligibility first (2 years?), arithmetic second. NBV = outstanding minus provision. Compare price with NBV only, never with the outstanding.',
    variants: [
      {
        label: 'Base case',
        q: `<p>An account has been NPA for 3 years. Outstanding ₹10 crore; provision held ₹6 crore. Proposed sale for cash, without recourse, at <strong>₹3 crore</strong>.</p>`,
        steps: [
          pick('Eligible to be sold?', ['Yes: 3 years ≥ 2 years, cash, no recourse', 'No'], 0, 'Meets the 2-year, cash and without-recourse conditions.', 'Eligible'),
          num('Net book value (₹ crore).', 4, '₹ crore', '10 − 6 = <strong>4</strong>.', 'NBV = 10−6 = 4'),
          num('Shortfall debited to P&amp;L (₹ crore).', 1, '₹ crore', '4 − 3 = <strong>1</strong>.', 'Loss on sale = 1'),
        ],
      },
      {
        label: 'Twist 1: above NBV',
        q: `<p>Same account, but the buyer pays <strong>₹7 crore</strong> in cash.</p>`,
        steps: [
          num('Excess of price over NBV (₹ crore).', 3, '₹ crore', '7 − 4 = <strong>3</strong>.', 'Excess = 3'),
          pick('Treatment of the excess?', ['Book as profit', 'Not profit; excess provision retained for losses on other NPA sales'], 1, 'The excess is <strong>not recognised as profit</strong> and the excess provision is not reversed.', 'Excess not profit'),
        ],
      },
      {
        label: 'Twist 2: too young',
        q: `<p>Same numbers, but the account has been NPA for <strong>18 months</strong>.</p>`,
        steps: [
          pick('Can it be sold?', ['Yes, price is fine', 'No, under the 2-year minimum'], 1, 'Eligibility fails at 18 months. No sale, so no arithmetic needed.', 'Not eligible (18 months)'),
        ],
      },
    ],
  },
  {
    id: 's-fraud', title: 'Cash shortage: is it a fraud report?', p: 'nbfc-frauds',
    tip: 'Two doors: over ₹10,000 always reportable. Over ₹5,000 reportable only when someone other than the cash handler found it and the handler did not report it at the time.',
    variants: [
      {
        label: 'Base case',
        q: `<p>An NBFC branch has a cash shortage of <strong>₹12,000</strong>, reported by the cashier on the same day.</p>`,
        steps: [pick('Report as fraud?', ['Yes: over ₹10,000', 'No'], 0, 'Over ₹10,000 is reported as fraud <strong>regardless of proven intent</strong>.', 'Over 10,000: report')],
      },
      {
        label: 'Twist 1',
        q: `<p>Shortage <strong>₹7,000</strong>, detected by the auditor; the cashier had not reported it.</p>`,
        steps: [pick('Report as fraud?', ['Yes: over ₹5,000 and detected by the auditor', 'No: under ₹10,000'], 0, 'Over ₹5,000, detected by management/auditor/inspector and not reported by the cash handler on occurrence: <strong>fraud report</strong>.', '7,000 detected by auditor: report')],
      },
      {
        label: 'Twist 2',
        q: `<p>Shortage <strong>₹7,000</strong>, reported by the cashier himself on the same day. No sign of intent.</p>`,
        steps: [pick('Report as fraud?', ['Yes', 'No, unless intent to cheat is suspected or proved'], 1, 'Below ₹10,000 and self-reported, so it is reported as fraud only if there is intent.', '7,000 self-reported: no')],
      },
      {
        label: 'Twist 3',
        q: `<p>Shortage <strong>₹4,000</strong>, detected by the auditor, not reported by the cashier.</p>`,
        steps: [pick('Report as fraud?', ['Yes: auditor found it', 'No: below ₹5,000, unless intent'], 1, 'Both thresholds are crossed only above ₹5,000. Below that, intent decides.', '4,000: no (unless intent)')],
      },
    ],
  },
  {
    id: 's-div3', title: 'Division III: the 1% test', p: 'nbfc-divII-vs-III',
    tip: '1% means move the decimal two places left. Compare the item with that number. The base is total income, not revenue.',
    variants: [
      {
        label: 'Base case',
        q: `<p>Ind AS NBFC, total income ₹10,000 crore, revenue from operations ₹9,900 crore. Manpower outsourcing cost inside other expenditure: ₹99.5 crore.</p>`,
        steps: [
          num('1% of total income (₹ crore).', 100, '₹ crore', '10,000 ÷ 100 = <strong>100</strong>.', '1% of 10,000 = 100'),
          pick('Separate disclosure needed?', ['Yes', 'No: 99.5 does not exceed 100'], 1, 'The item must <strong>exceed</strong> 1% of total income. 99.5 is below 100.', 'No separate note'),
        ],
      },
      {
        label: 'Twist: higher cost',
        q: `<p>Same company, but the outsourcing cost is ₹101 crore.</p>`,
        steps: [
          pick('Separate disclosure needed?', ['Yes: 101 is above 100', 'No'], 0, '101 &gt; 100: disclose separately.', 'Disclose (101>100)'),
        ],
      },
      {
        label: 'Twist: Division II',
        q: `<p>A non-NBFC Ind AS company: revenue from operations ₹10,000 crore. Same ₹101 crore item. Division II threshold is 1% of revenue or ₹10 lakh, whichever is higher.</p>`,
        steps: [
          num('Threshold in ₹ crore (1% of revenue vs ₹10 lakh = ₹0.1 crore; take the higher).', 100, '₹ crore', '1% of 10,000 = 100, much higher than 0.1, so the threshold is <strong>100</strong>.', 'Threshold = 100'),
          pick('Separate disclosure?', ['Yes, 101 exceeds 100', 'No'], 0, 'Yes, but notice the base changed (revenue, with a ₹10 lakh floor). Division III uses total income.', 'Disclose'),
        ],
      },
    ],
  },
];
