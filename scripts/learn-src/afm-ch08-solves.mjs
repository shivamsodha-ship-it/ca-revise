const num = (ask, ans, unit, say, note, tol) => ({ kind: 'num', ask, ans, unit, say, note, ...(tol !== undefined ? { tol } : {}) });
const pick = (ask, opts, pickIx, say, note) => ({ kind: 'pick', ask, opts, pickIx, say, note });

export default [
  {
    id: 's-nav', title: 'NAV and new units', p: 'mf-nav',
    tip: 'Keep everything in lakh. Add the assets in one go, then subtract the liabilities in one go. A NAV that comes out as a round number is usually right.',
    variants: [
      { label: 'Base case', q: '<p>A scheme (₹ lakh): shares at market 1,200; bonds 300; cash 50; receivables 20; accrued expenses 10; other payables 10. Units outstanding: 155 lakh.</p>',
        steps: [
          num('Total assets including receivables (₹ lakh).', 1570, '₹ lakh', '1,200 + 300 + 50 + 20 = <strong>1,570</strong>.', 'Assets 1,570'),
          num('Net assets (₹ lakh).', 1550, '₹ lakh', '1,570 − 10 − 10 = <strong>1,550</strong>.', 'Net assets 1,550'),
          num('NAV per unit (₹).', 10, '₹', '1,550 ÷ 155 = <strong>10</strong>.', 'NAV = 1,550 ÷ 155 = 10', 0.001),
        ] },
      { label: 'Twist 1: new investor', q: '<p>Same scheme. A new investor sends a cheque of ₹31 lakh.</p>',
        steps: [
          num('Units issued (lakh).', 3.1, 'lakh units', '31 ÷ 10 = <strong>3.1 lakh units</strong>.', 'Units issued 3.1 lakh', 0.001),
          num('NAV after the issue (₹).', 10, '₹', '(1,550 + 31) ÷ (155 + 3.1) = 1,581 ÷ 158.1 = <strong>10</strong>. Unchanged.', 'NAV unchanged = 10', 0.001),
        ] },
      { label: 'Twist 2: dividend', q: '<p>Same scheme. It now declares a dividend of ₹0.50 per unit.</p>',
        steps: [
          num('Total dividend (₹ lakh).', 77.5, '₹ lakh', '0.50 × 155 lakh units = <strong>77.5</strong>.', 'Dividend 77.5 lakh', 0.01),
          num('NAV after the dividend (₹).', 9.5, '₹', '10 − 0.50 = <strong>9.50</strong>. Check: (1,550 − 77.5) ÷ 155 = 9.50.', 'Ex-dividend NAV 9.50', 0.001),
        ] },
      { label: 'Twist 3: index scaling', q: '<p>Of the 1,200 lakh of shares, ₹100 lakh worth was bought when the index was 20,000, and the index is now 22,000. The ₹100 lakh is currently carried at cost. Restate using the index.</p>',
        steps: [
          num('Value of that block now (₹ lakh).', 110, '₹ lakh', '100 × 22,000 ÷ 20,000 = <strong>110</strong>.', 'Block = 110'),
          num('New net assets if the other 1,100 lakh of shares are at market (₹ lakh).', 1560, '₹ lakh', 'Previously 1,550 with the block at 100; now 1,550 − 100 + 110 = <strong>1,560</strong>.', 'Net assets 1,560'),
        ] },
    ],
  },
  {
    id: 's-loads', title: 'Loads: public offer price and redemption price', p: 'mf-load',
    tip: 'Pick the numbers so the division comes out clean: 49 ÷ 0.98 = 50 because 49 is 98% of 50. Front-end divides by (1 − f); back-end divides by (1 + b). Do not mix them.',
    variants: [
      { label: 'Base case', q: '<p>NAV ₹49 with a front-end load of 2%. Separately, NAV ₹50.50 with a back-end load of 1%. Use the ICAI formulae.</p>',
        steps: [
          num('Public offer price (₹).', 50, '₹', '49 ÷ (1 − 0.02) = 49 ÷ 0.98 = <strong>50</strong>.', 'POP = 49 ÷ 0.98 = 50', 0.01),
          num('Redemption price (₹).', 50, '₹', '50.50 ÷ (1 + 0.01) = 50.50 ÷ 1.01 = <strong>50</strong>.', 'RP = 50.50 ÷ 1.01 = 50', 0.01),
        ] },
      { label: 'Twist: find the loads', q: '<p>NAV ₹10; public offer price ₹10.204; redemption price ₹9.80.</p>',
        steps: [
          num('Front-end load by ICAI formula f = 1 − NAV ÷ POP (%).', 2, '%', '1 − 10 ÷ 10.204 = 0.01999 = <strong>2.0%</strong> (the alternative (POP − NAV) ÷ NAV gives 2.04%, also accepted).', 'f = 2.0% (alt 2.04%)', 0.05),
          num('Back-end load by ICAI formula b = NAV ÷ RP − 1 (%).', 2.04, '%', '10 ÷ 9.80 − 1 = 0.020408 = <strong>2.04%</strong> (alternative 2.0%).', 'b = 2.04% (alt 2.0%)', 0.05),
        ] },
    ],
  },
  {
    id: 's-required', title: 'Return a fund must earn', p: 'mf-req-return',
    tip: 'Two moves only: divide by (1 − initial) to gross up, then add recurring. For the reverse, subtract recurring first, then multiply by (1 − initial).',
    variants: [
      { label: 'Base case', q: '<p>An investor can earn 12% on his own. The scheme has initial expenses of 4% and recurring expenses of 1.5% a year. What must the scheme earn?</p>',
        steps: [
          num('Gross-up: 12 ÷ (1 − 0.04) (%).', 12.5, '%', '12 ÷ 0.96 = <strong>12.5</strong> (0.96 × 12.5 = 12).', 'Gross-up 12 ÷ 0.96 = 12.5', 0.01),
          num('Required scheme return: add recurring 1.5 (%).', 14, '%', '12.5 + 1.5 = <strong>14.0%</strong>.', 'r₂ = 14.0%', 0.01),
        ] },
      { label: 'Twist: reverse', q: '<p>The scheme earns a gross 14% with recurring expenses 2% and initial expenses 4%. What does the investor actually get?</p>',
        steps: [
          num('Net of recurring: 14 − 2 (%).', 12, '%', '14 − 2 = <strong>12</strong>.', 'After recurring 12'),
          num('Investor return: 12 × (1 − 0.04) (%).', 11.52, '%', '12 × 0.96 = <strong>11.52%</strong>.', 'r₁ = 11.52%', 0.01),
        ] },
    ],
  },
  {
    id: 's-hpr', title: 'Holding period return and reinvestment', p: 'mf-hpr',
    tip: 'Numerator first: price change plus everything paid out. Divide by the opening NAV only. For reinvestment compare the two end values, not the two percentages in your head.',
    variants: [
      { label: 'Base case', q: '<p>Opening NAV ₹100, closing NAV ₹104. During the period the fund distributed income ₹3 and capital gains ₹1 per unit.</p>',
        steps: [
          num('Total gain per unit: price change plus distributions (₹).', 8, '₹', '(104 − 100) + 3 + 1 = <strong>8</strong>.', 'Gain per unit 8'),
          num('Return (%).', 8, '%', '8 ÷ 100 = <strong>8%</strong>.', 'Return 8%', 0.01),
        ] },
      { label: 'Twist 1: reinvest', q: '<p>Investor holds 1,000 units bought at ₹100 (cost ₹1,00,000). The ₹4 per unit distribution is reinvested at an average NAV of ₹102. Closing NAV ₹104.</p>',
        steps: [
          num('Cash distributed (₹).', 4000, '₹', '1,000 × 4 = <strong>₹4,000</strong>.', 'Distribution 4,000'),
          num('Extra units (₹4,000 ÷ 102).', 39.22, 'units', '4,000 ÷ 102 = <strong>39.2157</strong>.', 'Extra units 39.22', 0.01),
          num('Closing value (₹): 1,039.2157 units × 104.', 108078.43, '₹', '1,039.2157 × 104 = <strong>₹1,08,078.43</strong>.', 'Value 1,08,078.43', 0.5),
          num('Return on cost (%).', 8.08, '%', '(1,08,078.43 − 1,00,000) ÷ 1,00,000 = <strong>8.08%</strong>, above the 8% payout return: reinvest.', 'Return 8.08% > 8%', 0.01),
        ] },
      { label: 'Twist 2: back-solve', q: '<p>Annualised return 12%. Opening NAV ₹50. Distribution this month: income ₹0.30, capital gain ₹0.20 per unit. Find the closing NAV.</p>',
        steps: [
          num('Monthly return (%).', 1, '%', '12 ÷ 12 = <strong>1%</strong>.', 'Monthly 1%'),
          num('Required total gain per unit (₹).', 0.5, '₹', '1% × 50 = <strong>0.50</strong>.', 'Gain needed 0.50', 0.001),
          num('Closing NAV (₹).', 50, '₹', 'Gain 0.50 is exactly the distributions (0.30 + 0.20), so the NAV change is nil: <strong>₹50</strong>.', 'Closing NAV 50', 0.001),
        ] },
    ],
  },
  {
    id: 's-yield', title: 'Effective yield per annum', p: 'mf-eff-yield',
    tip: 'Work in whole units. Gain per unit × units, add dividends, divide by the investment: that is the period yield. Then multiply by 365 ÷ days. Choose days that divide 365 (73 × 5 = 365).',
    variants: [
      { label: 'Base case', q: '<p>₹1,00,000 invested at NAV ₹20. After 73 days the NAV is ₹21.20 and a dividend of ₹0.40 per unit was received.</p>',
        steps: [
          num('Units bought.', 5000, 'units', '1,00,000 ÷ 20 = <strong>5,000</strong>.', 'Units 5,000'),
          num('Value gain plus dividends (₹).', 8000, '₹', '5,000 × 1.20 = 6,000; plus 5,000 × 0.40 = 2,000; total <strong>₹8,000</strong>.', 'Gain + dividends 8,000'),
          num('Yield for the period (%).', 8, '%', '8,000 ÷ 1,00,000 = <strong>8%</strong>.', 'Period yield 8%'),
          num('Effective yield p.a. (%).', 40, '%', '8 × 365 ÷ 73 = 8 × 5 = <strong>40%</strong>.', 'Yield p.a. 40%', 0.05),
        ] },
      { label: 'Twist 1: reverse', q: '<p>Documents lost. The period yield was 8% and ICAI-style effective yield p.a. was 40%. How many days was the money invested?</p>',
        steps: [num('Days held.', 73, 'days', '8 × 365 ÷ 40 = <strong>73</strong>.', 'Days = 8×365÷40 = 73', 0.5)] },
      { label: 'Twist 2: a loss', q: '<p>₹1,00,000 at NAV ₹20. After 30 days the NAV is ₹18.50, no dividend.</p>',
        steps: [
          num('Period yield (%).', -7.5, '%', '5,000 × (18.50 − 20) = −7,500; ÷ 1,00,000 = <strong>−7.5%</strong>.', 'Period yield −7.5%', 0.01),
          num('Effective yield p.a. (%).', -91.25, '%', '−7.5 × 365 ÷ 30 = <strong>−91.25%</strong>.', 'Yield p.a. −91.25%', 0.05),
        ] },
    ],
  },
  {
    id: 's-plans', title: 'Plan-wise units', p: 'mf-plan-yield',
    tip: 'Dividend percentage is on the face value of ₹10, never on NAV. Write the three plans as three one-line sums and compare the end values.',
    variants: [
      { label: 'Base case', q: '<p>1,000 units bought at ₹25. A 20% dividend (face value ₹10) is declared at an ex-dividend NAV of ₹25. Plan A reinvests the dividend, Plan B gets a 1:5 bonus, Plan C is growth. Closing NAVs: A ₹30, B ₹25, C ₹31. Ignore tax.</p>',
        steps: [
          num('Dividend in rupees: 1,000 × 10 × 20%.', 2000, '₹', '1,000 × 10 × 0.20 = <strong>₹2,000</strong>.', 'Dividend 2,000'),
          num('Plan A units after reinvestment at ₹25.', 1080, 'units', '1,000 + 2,000 ÷ 25 = 1,000 + 80 = <strong>1,080</strong>.', 'A units 1,080'),
          num('Plan B units after a 1:5 bonus.', 1200, 'units', '1,000 + 1,000 ÷ 5 = <strong>1,200</strong>.', 'B units 1,200'),
          num('Plan A closing value (₹).', 32400, '₹', '1,080 × 30 = <strong>₹32,400</strong>.', 'A value 32,400'),
          num('Plan B closing value (₹).', 30000, '₹', '1,200 × 25 = <strong>₹30,000</strong>.', 'B value 30,000'),
          num('Plan C closing value (₹).', 31000, '₹', '1,000 × 31 = <strong>₹31,000</strong>.', 'C value 31,000'),
          pick('Which plan gave the highest return on ₹25,000?', ['A (reinvestment)', 'B (bonus)', 'C (growth)'], 0, 'A: 32,400 against 30,000 and 31,000. Gain 7,400 ÷ 25,000 = 29.6%.', 'A wins: 29.6%'),
        ] },
      { label: 'Twist: undo the bonus', q: '<p>After a 1:5 bonus an investor holds 1,200 units. How many did he hold before?</p>',
        steps: [num('Units before the bonus.', 1000, 'units', '1,200 × 5 ÷ 6 = <strong>1,000</strong>.', 'Before = 1,200 × 5÷6 = 1,000')] },
      { label: 'Twist: undo the reinvestment', q: '<p>After reinvesting a 20% dividend (face ₹10) at ex-dividend NAV ₹25, an investor holds 1,080 units. How many before?</p>',
        steps: [num('Units before the reinvestment.', 1000, 'units', 'Units after = units before × (1 + 10 × 0.20 ÷ 25) = × 1.08; 1,080 ÷ 1.08 = <strong>1,000</strong>.', 'Before = 1,080 ÷ 1.08 = 1,000')] },
    ],
  },
  {
    id: 's-beta-nav', title: 'Expected NAV from Sharpe, Treynor and beta', p: 'mf-beta-nav',
    tip: 'Order of operations: excess return, beta, equity move, cash less expenses, add. Beta touches only the equity part. With Sharpe 2 and σ 10, the excess return is 20 without a calculator.',
    variants: [
      { label: 'Base case', q: '<p>A fund has NAV ₹80 with 95% in equity and the rest in cash. Sharpe ratio 2, standard deviation 10, Treynor ratio 16. The market falls 4%. Monthly expenses are ₹1 and are paid from cash.</p>',
        steps: [
          num('Equity and cash parts (equity value in ₹).', 76, '₹', '95% × 80 = <strong>76</strong>; cash is 4.', 'Equity 76, cash 4'),
          num('Excess return = Sharpe × σ.', 20, '', '2 × 10 = <strong>20</strong>.', 'Excess return 20'),
          num('Beta = excess return ÷ Treynor.', 1.25, '', '20 ÷ 16 = <strong>1.25</strong>.', 'β = 1.25', 0.001),
          num('Equity change: β × (−4%) (%).', -5, '%', '1.25 × −4 = <strong>−5%</strong>.', 'Equity −5%', 0.01),
          num('Revised equity (₹).', 72.2, '₹', '76 × 0.95 = <strong>72.20</strong>.', 'Equity 72.20', 0.01),
          num('Expected NAV (₹): revised equity plus cash (4 − 1).', 75.2, '₹', '72.20 + 3 = <strong>75.20</strong>.', 'NAV 75.20', 0.01),
        ] },
      { label: 'Twist 1: market rises', q: '<p>Same fund; the market rises 8% instead.</p>',
        steps: [
          num('Equity change (%).', 10, '%', '1.25 × 8 = <strong>10%</strong>.', 'Equity +10%'),
          num('Expected NAV (₹).', 86.6, '₹', '76 × 1.10 = 83.60; plus cash 3 = <strong>86.60</strong>.', 'NAV 86.60', 0.01),
        ] },
      { label: 'Twist 2: different ratios', q: '<p>Another fund: Sharpe 3, σ 5, Treynor 10. Find its beta.</p>',
        steps: [num('Beta.', 1.5, '', '3 × 5 = 15; 15 ÷ 10 = <strong>1.5</strong>.', 'β = 1.5', 0.001)] },
    ],
  },
  {
    id: 's-te', title: 'Tracking error', p: 'mf-tracking-error',
    tip: 'Choose to subtract the mean first: the deviations then add to zero (a free check). Remember n − 1.',
    variants: [
      { label: 'Base case', q: '<p>Fund returns over five quarters: 8, 5, 6, 3, 7 (%). Benchmark returns: 5, 4, 5, 4, 6 (%).</p>',
        steps: [
          num('Mean differential d̄ where d = fund − benchmark (%).', 1, '%', 'd = 3, 1, 1, −1, 1; sum 5; mean <strong>1</strong>.', 'd = 3,1,1,−1,1; mean 1'),
          num('Sum of squared deviations Σ(d − d̄)².', 8, '', 'Deviations 2, 0, 0, −2, 0; squares 4 + 0 + 0 + 4 + 0 = <strong>8</strong>.', 'Σ sq dev = 8'),
          num('Variance with n − 1 = 4.', 2, '', '8 ÷ 4 = <strong>2</strong>.', 'Variance 2'),
          num('Tracking error (%).', 1.414, '%', '√2 = <strong>1.414%</strong>.', 'TE = √2 = 1.414%', 0.01),
        ] },
    ],
  },
  {
    id: 's-hedge', title: 'Hedge fund fees', p: 'mf-hedge',
    tip: 'Compute the new value first, compare with the high-water mark, and only then take the percentage. If the new value is below the mark the incentive is zero.',
    variants: [
      { label: 'Base case', q: '<p>Assets ₹20 crore; fixed fee 0.10%; incentive 2% of value above the high-water mark of ₹21 crore. The fund returns 29%.</p>',
        steps: [
          num('Fixed fee (₹ lakh).', 2, '₹ lakh', '0.10% × ₹20 crore = ₹0.02 crore = <strong>₹2 lakh</strong>.', 'Fixed fee 2 lakh', 0.01),
          num('New value (₹ crore).', 25.8, '₹ crore', '20 × 1.29 = <strong>25.8</strong>.', 'New value 25.8', 0.001),
          num('Incentive fee (₹ lakh).', 9.6, '₹ lakh', '(25.8 − 21) × 2% = 4.8 × 0.02 = 0.096 crore = <strong>₹9.6 lakh</strong>.', 'Incentive 9.6 lakh', 0.01),
          num('Total fee (₹ lakh).', 11.6, '₹ lakh', '2 + 9.6 = <strong>₹11.6 lakh</strong>.', 'Total 11.6 lakh', 0.01),
        ] },
      { label: 'Twist 1: below the mark', q: '<p>Same fund; the return is only 4.5%.</p>',
        steps: [
          num('New value (₹ crore).', 20.9, '₹ crore', '20 × 1.045 = <strong>20.90</strong>, below the ₹21 crore mark.', 'New value 20.90', 0.001),
          num('Total fee (₹ lakh).', 2, '₹ lakh', 'No incentive. Fixed fee only: <strong>₹2 lakh</strong>.', 'Total 2 lakh', 0.01),
        ] },
      { label: 'Twist 2: a fall', q: '<p>Same fund; the return is −1.8%.</p>',
        steps: [num('Total fee (₹ lakh).', 2, '₹ lakh', 'The new value is below the mark; incentive nil. The fixed fee is on assets: <strong>₹2 lakh</strong> (as in the SM answer).', 'Total 2 lakh', 0.01)] },
    ],
  },
  {
    id: 's-crp', title: 'Constant ratio plan', p: 'mf-constant-ratio',
    tip: 'Write total value, then half of it for each side. The units to trade are the gap in equity value divided by the NAV. Fall: buy. Rise: sell.',
    variants: [
      { label: 'Base case', q: '<p>₹2,00,000 split 50:50 between bonds and units at NAV ₹50 (₹1,00,000 each, 2,000 units). Trigger: rebalance when NAV moves 15% or more from the last month. The NAV falls to ₹40.</p>',
        steps: [
          num('NAV move from 50 to 40 (%).', -20, '%', '(40 − 50) ÷ 50 = <strong>−20%</strong>, beyond the 15% trigger.', 'Move −20%: rebalance', 0.01),
          num('Total value now (₹).', 180000, '₹', '1,00,000 + 2,000 × 40 = <strong>₹1,80,000</strong>.', 'Total 1,80,000'),
          num('Equity value now (₹).', 80000, '₹', '2,000 × 40 = <strong>₹80,000</strong>.', 'Equity 80,000'),
          num('Units to buy.', 250, 'units', 'Target 90,000; gap 10,000; ÷ 40 = <strong>250</strong>.', 'Buy 250 units'),
        ] },
      { label: 'Twist: NAV rebounds', q: '<p>After that rebalancing the plan holds 2,250 units and ₹90,000 of bonds. The NAV rises 20% to ₹48.</p>',
        steps: [
          num('Total value (₹).', 198000, '₹', '90,000 + 2,250 × 48 = 90,000 + 1,08,000 = <strong>₹1,98,000</strong>.', 'Total 1,98,000'),
          num('Units to sell.', 187.5, 'units', 'Target 99,000; equity 1,08,000; sell 9,000 ÷ 48 = <strong>187.5</strong>.', 'Sell 187.5 units', 0.01),
        ] },
    ],
  },
  {
    id: 's-gilt', title: 'Gilt duration churn', p: 'mf-gilt-duration',
    tip: 'Rule first: rates down means duration up (sell shortest, buy longest); rates up means duration down. Then (sum − sold + bought) ÷ n.',
    variants: [
      { label: 'Base case', q: '<p>A gilt fund holds four bonds with durations 4, 6, 8 and 10 years. Rates are expected to fall; the manager sells the shortest and buys a 16-year bond.</p>',
        steps: [
          num('Current average duration (years).', 7, 'years', '28 ÷ 4 = <strong>7</strong>.', 'Average 7'),
          num('Revised average duration (years).', 10, 'years', '(28 − 4 + 16) ÷ 4 = 40 ÷ 4 = <strong>10</strong>.', 'Revised 10'),
        ] },
      { label: 'Twist: rates rise', q: '<p>Instead rates are expected to rise. The manager sells the longest bond and buys a 3-year bond.</p>',
        steps: [
          pick('Direction of the duration change?', ['Raise duration', 'Cut duration'], 1, 'Rates up means cut duration: sell the longest, buy a shorter one.', 'Cut duration'),
          num('Revised average duration (years).', 5.25, 'years', '(28 − 10 + 3) ÷ 4 = 21 ÷ 4 = <strong>5.25</strong>.', 'Revised 5.25', 0.001),
        ] },
    ],
  },
  {
    id: 's-deq', title: 'Dividend equalisation prices', p: 'mf-div-eq',
    tip: 'Income per unit first. Then both prices are the load-adjusted opening NAV plus that income. ICAI applies the load on the NAV given, no month-by-month growth.',
    variants: [
      { label: 'Base case', q: '<p>Opening NAV ₹20. Undistributed income to date ₹20 lakh on 100 lakh units. Entry load 2%, exit load 1%.</p>',
        steps: [
          num('Income per unit (₹).', 0.2, '₹', '20 ÷ 100 = <strong>0.20</strong>.', 'Income/unit 0.20', 0.001),
          num('Issue price (₹).', 20.6, '₹', '20 × 1.02 = 20.40; plus 0.20 = <strong>20.60</strong>.', 'Issue price 20.60', 0.001),
          num('Repurchase price (₹).', 20, '₹', '20 × 0.99 = 19.80; plus 0.20 = <strong>20.00</strong>.', 'Repurchase price 20.00', 0.001),
        ] },
    ],
  },
  {
    id: 's-closed', title: 'Closed-end premium and geometric return', p: 'mf-closed-premium',
    tip: 'Two returns, two bases: the fund earns the NAV; the investor earns the price. Square roots of familiar numbers: 1.21 → 1.1; 1.2705 is close to 1.127².',
    variants: [
      { label: 'Base case', q: '<p>A closed-end fund\'s NAV grows from ₹20 to ₹24.20 over 2 periods. The investor bought at NAV (no premium or discount) and sells when the units trade at a 5% premium.</p>',
        steps: [
          num('Fund\'s growth per period, geometric (%).', 10, '%', '(24.20 ÷ 20)^(1/2) − 1 = 1.21^(0.5) − 1 = 1.1 − 1 = <strong>10%</strong>.', 'NAV growth 10% p.p.', 0.01),
          num('Exit price at a 5% premium (₹).', 25.41, '₹', '24.20 × 1.05 = <strong>25.41</strong>.', 'Exit price 25.41', 0.001),
          num('Investor\'s geometric return per period (%).', 12.71, '%', '(25.41 ÷ 20)^(1/2) − 1 = 1.2705^0.5 − 1 = 1.1271 − 1 = <strong>12.71%</strong>.', 'Investor 12.71% p.p.', 0.05),
        ] },
    ],
  },
];
