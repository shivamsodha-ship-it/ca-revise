// FR Ch 9 — step solvers with twisted versions. Base cases are SM/ICAI questions; every figure is recomputed in fr-ch09.mjs.
const num = (ask, ans, unit, say, note, tol) => ({ kind: 'num', ask, ans, unit, say, note, ...(tol !== undefined ? { tol } : {}) });
const pick = (ask, opts, pickIx, say, note) => ({ kind: 'pick', ask, opts, pickIx, say, note });

export default [
  {
    id: 's-voucher', title: 'Material right: discount voucher', p: 'r115-options',
    tip: 'Only the extra discount counts. Spend × extra % × chance = the voucher\'s price; then split the sale in the ratio of the two prices.',
    variants: [
      { label: 'Base case (SM Illustration 23)', q: '<p>Product A sold for ₹1,000 with a 40% voucher on up to ₹1,000 of purchases in 30 days. Everyone gets 10% in that period anyway. 80% of customers will use it, spending ₹500 on average.</p>',
        steps: [
          num('Incremental discount (%).', 30, '%', '40% − 10% = <strong>30%</strong>.', 'Incremental 30%', 0),
          num('Stand-alone selling price of the voucher (₹).', 120, '₹', '500 × 30% × 80% = <strong>120</strong>.', 'Voucher SSP 120', 0.5),
          num('Allocated to Product A (₹, nearest 10).', 890, '₹', '1,000 × 1,000 ÷ 1,120 = 892.9 → <strong>890</strong>.', 'A = 890', 5),
          num('Allocated to the voucher (₹, nearest 10).', 110, '₹', '1,000 × 120 ÷ 1,120 = 107.1 → <strong>110</strong>.', 'Voucher = 110', 5)
        ] },
      { label: 'Twist: PYQ May 2025 MCQ 13', q: '<p>Product H sold for ₹2,000 with a 40% voucher; 10% seasonal discount for all; 90% likely to be used on ₹1,000 of purchases.</p>',
        steps: [
          num('Voucher SSP (₹).', 270, '₹', '1,000 × 30% × 90% = <strong>270</strong>.', 'Voucher SSP 270', 0.5),
          num('Allocated to Product H (₹).', 1762, '₹', '2,000 × 2,000 ÷ 2,270 = <strong>1,762</strong>.', 'H = 1,762', 1),
          num('Allocated to the voucher (₹).', 238, '₹', '2,000 × 270 ÷ 2,270 = <strong>238</strong>.', 'Voucher = 238', 1)
        ] },
      { label: 'Twist: everyone gets 40%', q: '<p>Same as the base case, but the seasonal discount for all customers is 40%.</p>',
        steps: [
          pick('Is the voucher a separate performance obligation?', ['Yes — allocate ₹120 SSP', 'No — it is a marketing offer, no allocation'], 1, 'No incremental discount → no material right.', 'Marketing offer')
        ] }
    ]
  },
  {
    id: 's-catchup', title: 'Contract modification: cumulative catch-up', p: 'r115-mod',
    tip: 'Blend the rate first: (old total + added) ÷ new hours. Then re-price what is done and compare with what is booked.',
    variants: [
      { label: 'Base case (SM Illustration 9)', q: '<p>200 hours at ₹150. After 100 hours, 50 more hours are added at ₹100. Remaining work is not distinct.</p>',
        steps: [
          num('Contract amount after modification (₹).', 35000, '₹', '30,000 + 5,000 = <strong>35,000</strong>.', 'Total 35,000'),
          num('Blended rate per hour (₹).', 140, '₹', '35,000 ÷ 250 = <strong>140</strong>.', 'Rate 140', 0),
          num('Adjustment to revenue (₹).', -1000, '₹', '100 × 140 − 15,000 = <strong>(1,000)</strong>.', 'Catch-up (1,000)', 0)
        ] },
      { label: 'Twist: PYQ May 2026 MCQ 12', q: '<p>200 hours at ₹300; after 100 hours, 50 hours more at ₹200.</p>',
        steps: [
          num('Blended rate (₹).', 280, '₹', '(60,000 + 10,000) ÷ 250 = <strong>280</strong>.', 'Rate 280', 0),
          num('Adjustment (₹).', -2000, '₹', '100 × 280 − 30,000 = <strong>(2,000)</strong>.', 'Catch-up (2,000)', 0)
        ] },
      { label: 'Twist: SM PQ 8 (bonus becomes includable)', q: '<p>Price ₹20,00,000 (bonus ₹2,50,000 constrained); costs ₹11,00,000; 65% done in year 1. Modification adds ₹1,50,000 price and ₹80,000 cost and makes the bonus highly probable. Cost to date ₹7,15,000.</p>',
          steps: [
          num('Year 1 revenue (₹).', 1300000, '₹', '20,00,000 × 65% = <strong>13,00,000</strong>.', 'Y1 revenue 13,00,000'),
          num('Revised transaction price (₹).', 2400000, '₹', '20,00,000 + 1,50,000 + 2,50,000 = <strong>24,00,000</strong>.', 'TP 24,00,000'),
          num('Progress after modification (%, two decimals).', 60.6, '%', '7,15,000 ÷ 11,80,000 = 60.59%; ICAI uses <strong>60.60%</strong>.', 'Progress 60.60%', 0.02),
          num('Catch-up revenue on modification (₹).', 154400, '₹', '60.60% × 24,00,000 − 13,00,000 = <strong>1,54,400</strong>.', 'Catch-up 1,54,400', 200)
        ] }
    ]
  },
  {
    id: 's-return', title: 'Sale with a right of return', p: 'r115-return',
    tip: 'Three numbers, three multiplications: price × kept, price × returned, cost × returned.',
    variants: [
      { label: 'Base case (SM Illustration 34)', q: '<p>1,000 products at ₹50, cost ₹30, 30-day return right; 970 expected to be kept; recovery costs immaterial.</p>',
        steps: [
          num('Revenue (₹).', 48500, '₹', '970 × 50 = <strong>48,500</strong>.', 'Revenue 48,500'),
          num('Refund liability (₹).', 1500, '₹', '30 × 50 = <strong>1,500</strong>.', 'Refund liability 1,500'),
          num('Asset for goods to be recovered (₹).', 900, '₹', '30 × 30 = <strong>900</strong>.', 'Asset 900')
        ] },
      { label: 'Twist: restocking fee (SM Example 4)', q: '<p>10 units at ₹100, 10% expected returns, 3% restocking fee charged on returns.</p>',
        steps: [
          num('Revenue (₹).', 903, '₹', '9 × 100 + 1 × 3 = <strong>903</strong>.', 'Revenue 903', 0),
          num('Refund liability (₹).', 97, '₹', '1 × (100 − 3) = <strong>97</strong>.', 'Refund liability 97', 0)
        ] },
      { label: 'Twist: no experience of returns', q: '<p>New product, 90-day return right, no evidence of returns (as in SM Illustration 38).</p>',
        steps: [
          pick('Revenue at delivery?', ['Full price', 'Price × expected keepers', 'Possibly none until the return period ends — the constraint applies'], 2, 'Without experience the estimate may be fully constrained.', 'Constraint may defer all revenue')
        ] }
    ]
  },
  {
    id: 's-progress', title: 'Input method with uninstalled materials', p: 'r115-progress',
    tip: 'Take the bought-in item out of both the price and the costs, find the %, then add the item back at cost.',
    variants: [
      { label: 'Base case (SM Illustration 65)', q: '<p>Price ₹50,00,000; elevators ₹15,00,000 (delivered early, procured); other costs ₹25,00,000, of which ₹5,00,000 incurred.</p>',
        steps: [
          num('Measure of progress (%).', 20, '%', '5,00,000 ÷ 25,00,000 = <strong>20%</strong>.', 'Progress 20%', 0),
          num('Revenue on other work (₹).', 700000, '₹', '20% × (50,00,000 − 15,00,000) = <strong>7,00,000</strong>.', 'Other revenue 7,00,000'),
          num('Total revenue (₹).', 2200000, '₹', '7,00,000 + 15,00,000 = <strong>22,00,000</strong>.', 'Revenue 22,00,000')
        ] },
      { label: 'Twist: SM TYK 3', q: '<p>Price ₹50,00,000; air conditioners ₹10,00,000; other costs ₹30,00,000, of which ₹6,00,000 incurred.</p>',
        steps: [
          num('Measure of progress (%).', 20, '%', '6,00,000 ÷ 30,00,000 = <strong>20%</strong>.', 'Progress 20%', 0),
          num('Revenue (₹).', 1800000, '₹', '20% × 40,00,000 + 10,00,000 = <strong>18,00,000</strong>.', 'Revenue 18,00,000'),
          num('Profit (₹).', 200000, '₹', '18,00,000 − (6,00,000 + 10,00,000) = <strong>2,00,000</strong>.', 'Profit 2,00,000')
        ] },
      { label: 'Twist: PYQ Nov 2024 MCQ 5', q: '<p>Price ₹30,00,000; elevator ₹10,00,000; other costs ₹12,00,000, of which ₹3,00,000 incurred.</p>',
        steps: [
          num('Measure of progress (%).', 25, '%', '3,00,000 ÷ 12,00,000 = <strong>25%</strong>.', 'Progress 25%', 0),
          num('Revenue (₹).', 1500000, '₹', '25% × 20,00,000 + 10,00,000 = <strong>15,00,000</strong>.', 'Revenue 15,00,000')
        ] }
    ]
  },
  {
    id: 's-finance', title: 'Significant financing component', p: 'r115-financing',
    tip: 'Arrears: divide by (1 + r)ⁿ to get revenue. Advance: multiply by (1 + r)ⁿ to get revenue.',
    variants: [
      { label: 'Base case (SM Illustration 38)', q: '<p>₹1,21,000 payable 24 months after delivery; implicit rate 10%; cash price ₹1,00,000.</p>',
        steps: [
          num('Revenue (₹).', 100000, '₹', '1,21,000 ÷ 1.1² = <strong>1,00,000</strong>.', 'Revenue 1,00,000'),
          num('Total interest income (₹).', 21000, '₹', '1,21,000 − 1,00,000 = <strong>21,000</strong>.', 'Interest 21,000'),
          num('Interest in year 1 (₹).', 10000, '₹', '1,00,000 × 10% = <strong>10,000</strong>.', 'Year 1 interest 10,000')
        ] },
      { label: 'Twist: advance (SM Illustration 40)', q: '<p>₹4,000 received two years before delivery; incremental borrowing rate 6%.</p>',
        steps: [
          num('Revenue at transfer (₹).', 4494, '₹', '4,000 × 1.06² = 4,494.4 → <strong>4,494</strong>.', 'Revenue 4,494', 1),
          num('Interest expense over two years (₹).', 494, '₹', '4,494 − 4,000 = <strong>494</strong>.', 'Interest 494', 1)
        ] },
      { label: 'Twist: within a year', q: '<p>Payment due 10 months after delivery.</p>',
        steps: [
          pick('Adjust for financing?', ['Yes, always', 'No — practical expedient (≤ 1 year)'], 1, 'Para 63 practical expedient.', 'No adjustment ≤ 1 year')
        ] }
    ]
  },
  {
    id: 's-points', title: 'Loyalty points: allocate and release', p: 'r115-options',
    tip: 'Points value = points × value × expected redemption. Share the sale in the ratio sale : points value.',
    variants: [
      { label: 'Base case (SM PQ 5(a))', q: '<p>Sales ₹10,00,000; 10 points per ₹500; ₹0.50 a point; 80% expected to be redeemed.</p>',
        steps: [
          num('Points awarded.', 20000, 'points', '10,00,000 ÷ 500 × 10 = <strong>20,000</strong>.', 'Points 20,000', 0),
          num('Value of points (₹).', 8000, '₹', '20,000 × 0.5 × 80% = <strong>8,000</strong>.', 'Points value 8,000', 0),
          num('Deferred for points (₹).', 7937, '₹', '10,00,000 × 8,000 ÷ 10,08,000 = <strong>7,937</strong>.', 'Deferred 7,937', 1),
          num('Revenue for goods (₹).', 992063, '₹', '10,00,000 − 7,937 = <strong>9,92,063</strong>.', 'Goods 9,92,063', 1)
        ] },
      { label: 'Twist: SM PQ 9 (resort points)', q: '<p>₹10,000 stay earns 100 points with a stand-alone selling price of ₹500.</p>',
        steps: [
          num('Allocated to points (₹).', 476, '₹', '10,000 × 500 ÷ 10,500 = <strong>476</strong>.', 'Points 476', 1),
          num('Allocated to the stay (₹).', 9524, '₹', '10,000 × 10,000 ÷ 10,500 = <strong>9,524</strong>.', 'Stay 9,524', 1)
        ] }
    ]
  }
];
