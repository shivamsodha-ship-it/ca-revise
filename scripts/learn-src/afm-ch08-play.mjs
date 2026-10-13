export const compare = {
  title: 'Sharpe vs Treynor',
  cols: ['Sharpe', 'Treynor'],
  rows: [
    { d: 'Formula', a: '(R<sub>p</sub> − R<sub>f</sub>) ÷ σ<sub>p</sub>', b: '(R<sub>p</sub> − R<sub>f</sub>) ÷ β<sub>p</sub>', p: 'mf-eval-quant' },
    { d: 'Risk in the denominator', a: 'Total risk (standard deviation).', b: 'Systematic (market) risk, beta against the fund\'s benchmark.', p: 'mf-eval-quant' },
    { d: 'Suits which investor', a: 'An undiversified investor, for whom total risk matters.', b: 'A well-diversified investor, for whom only market risk matters.', p: 'mf-eval-quant' },
    { d: 'Numerator', a: 'Excess return over the risk-free rate.', b: 'Excess return over the risk-free rate.', same: true, p: 'mf-eval-quant' },
    { d: 'Higher is', a: 'Better: more return per unit of risk.', b: 'Better: more return per unit of risk.', same: true, p: 'mf-eval-quant' },
    { d: 'Use in the beta sum', a: 'Excess return = Sharpe × σ.', b: 'β = excess return ÷ Treynor.', p: 'mf-beta-nav' },
    { d: 'Used to rank funds', a: 'Yes, in RTP/MTP ranking sums.', b: 'Yes, in RTP/MTP ranking sums.', same: true, p: 'mf-eval-quant' },
    { d: 'Memory hook', a: 'Sharpe = σ (total).', b: 'Treynor = β (systematic).', p: 'mf-eval-quant' },
  ],
  sorter: [
    { s: 'Divides excess return by standard deviation.', ans: 0, why: 'Sharpe uses total risk σ.' },
    { s: 'Divides excess return by beta.', ans: 1, why: 'Treynor uses β.' },
    { s: 'Suits an undiversified investor.', ans: 0, why: 'Total risk matters to an undiversified investor.' },
    { s: 'Suits a well-diversified investor.', ans: 1, why: 'Only systematic risk remains.' },
    { s: 'The numerator is return over the risk-free rate.', ans: 2, why: 'Both use Rp − Rf.' },
    { s: 'Given with σ to find excess return.', ans: 0, why: 'Excess return = Sharpe × σ.' },
    { s: 'Given with excess return to find beta.', ans: 1, why: 'β = excess return ÷ Treynor.' },
    { s: 'Uses downside deviation instead.', ans: 3, why: 'That is the Sortino ratio, neither of these.' },
    { s: 'A higher value means a better risk-adjusted return.', ans: 2, why: 'True for both.' },
    { s: 'Compares actual return with the CAPM expected return.', ans: 3, why: 'That is Jensen\'s alpha.' },
    { s: 'Active return divided by tracking error.', ans: 3, why: 'That is the information ratio.' },
  ],
};

export const games = [
  {
    id: 'g-setup-numbers', type: 'match', title: 'Set-up and regulation numbers', intro: 'Six random pairs each round.',
    pairs: [
      ['Sponsor\'s minimum track record', '5 years'], ['Sponsor\'s share of AMC net worth', 'at least 40%'], ['Independent trustees', 'at least two-thirds'],
      ['Independent AMC directors', 'at least 50%'], ['Removal of AMC by unit holders', '75%'], ['AMC net worth (per the SM)', '₹100 crore'],
      ['Multicap minimum in each cap', '25%'], ['ELSS lock-in', '3 years'], ['SEBI cap, equity funds (SM)', '2.50%'],
      ['Direct plans introduced', '1 January 2013'], ['Trail commission', '0.30% to 0.75%'], ['Evaluate a fund', 'every 6 to 12 months'],
    ],
  },
  {
    id: 'g-structure', type: 'sort', title: 'Open, close or interval?', intro: 'Place each feature under the right structure.',
    buckets: ['Open-ended', 'Close-ended', 'Interval'],
    items: [
      { t: 'Enter and exit any time at NAV', b: 0 }, { t: 'Capital is unlimited', b: 0 },
      { t: 'Units bought on the exchange after listing', b: 1 }, { t: 'Limited life, then the corpus is liquidated', b: 1 },
      { t: 'FMPs must be of this kind', b: 1, why: 'FMPs, CPOFs and Real Estate MFs are close-ended.' },
      { t: 'Open for purchase and redemption only at set intervals', b: 2 }, { t: 'Need not be listed; no defined maturity', b: 2 },
      { t: 'Liquidity comes from the fund repurchasing units', b: 0 }, { t: 'Liquidity comes from listing', b: 1 },
    ],
  },
  {
    id: 'g-bond-risk', type: 'sort', title: 'Which bond-fund risk?', intro: 'I-C-P-R. Read the situation and pick the risk.',
    buckets: ['Interest-rate', 'Credit', 'Prepayment', 'Reinvestment'],
    items: [
      { t: 'Yields rise and the bond\'s market value falls', b: 0 }, { t: 'The issuer fails to pay interest on time', b: 1 },
      { t: 'A callable bond is redeemed early because rates have fallen', b: 2 }, { t: 'Maturity proceeds can only be reinvested at lower rates', b: 3 },
      { t: 'A lower-rated issuer carries more of this risk', b: 1 }, { t: 'The manager raises duration to gain when rates fall', b: 0, why: 'Duration management is an answer to interest-rate risk.' },
      { t: 'Favourable if rates rise', b: 3, why: 'Reinvestment risk works in the investor\'s favour when rates rise.' },
    ],
  },
  {
    id: 'g-measure', type: 'sort', title: 'Which performance measure?', intro: 'Sharpe, Treynor, Sortino or Jensen: sort by what the measure uses.',
    buckets: ['Sharpe', 'Treynor', 'Sortino', 'Jensen\'s alpha'],
    items: [
      { t: 'Standard deviation in the denominator', b: 0 }, { t: 'Beta in the denominator', b: 1 }, { t: 'Downside deviation in the denominator', b: 2 },
      { t: 'Return above the CAPM expected return', b: 3 }, { t: 'Suits an undiversified investor', b: 0 }, { t: 'Suits a well-diversified investor', b: 1 },
      { t: 'Needs the market return and risk-free rate to compute the benchmark', b: 3 }, { t: 'Excess return = this ratio × σ', b: 0 }, { t: 'Beta = excess return ÷ this ratio', b: 1 },
    ],
  },
  {
    id: 'g-fund-kind', type: 'sort', title: 'Which type of fund?', intro: 'Concept questions in a few words.',
    buckets: ['International', 'Offshore', 'Fund of funds', 'Index fund', 'ETF'].slice(0, 4),
    items: [
      { t: 'Raises money in India and invests abroad', b: 0 }, { t: 'Located abroad, raises money globally to invest in India', b: 1 },
      { t: 'Invests in units of other mutual fund schemes', b: 2 }, { t: 'Holds index stocks in the same weights, passively managed', b: 3 },
      { t: 'Direction of money flow: India to the world', b: 0 }, { t: 'Direction of money flow: world to India', b: 1 },
      { t: 'Manager\'s main job is minimum tracking error', b: 3 },
    ],
  },
  {
    id: 'g-twist', type: 'sort', title: 'As written, or twisted?', intro: 'Each statement is either as the SM says or has one fact changed.',
    buckets: ['As written', 'Twisted'],
    items: [
      { t: 'POP = NAV ÷ (1 − front-end load).', b: 0 }, { t: 'Redemption price = NAV ÷ (1 − back-end load).', b: 1, why: 'Twisted: it is ÷ (1 + b).' },
      { t: 'Required fund return = r₁ ÷ (1 − initial expenses) + recurring expenses.', b: 0 }, { t: 'Tracking error divides by n.', b: 1, why: 'Twisted: n − 1.' },
      { t: 'Dividend reinvestment units use dividend % on NAV.', b: 1, why: 'Twisted: on face value (₹10).' }, { t: 'Hedge fund incentive is charged only above the high-water mark.', b: 0 },
      { t: 'In a constant ratio plan the investor sells when NAV falls.', b: 1, why: 'Twisted: buys on a fall, sells on a rise.' }, { t: 'Beta = Sharpe × σ ÷ Treynor.', b: 0 },
      { t: 'ELSS lock-in is 5 years.', b: 1, why: 'Twisted: 3 years.' }, { t: 'Multicap needs at least 25% in each of large, mid and small caps.', b: 0 },
      { t: 'When rates are expected to fall, the manager reduces duration.', b: 1, why: 'Twisted: raises it.' }, { t: 'Exit load goes to the AMC.', b: 1, why: 'Twisted: it goes into the scheme.' },
      { t: 'Direct plans were introduced from 1 January 2013.', b: 0 }, { t: 'Beta is applied to the whole NAV, cash included.', b: 1, why: 'Twisted: only the equity part.' },
    ],
  },
  {
    id: 'g-order', type: 'order', title: 'Put the working in order', intro: 'ICAI gives marks for the steps. Know their order.',
    rounds: [
      { q: 'Computing NAV', items: ['Value each holding at market', 'Add receivables and accrued income', 'Deduct accrued expenses and payables', 'Divide net assets by units outstanding'] },
      { q: 'Expected NAV after a market move (beta sum)', items: ['Split NAV into equity and cash', 'Excess return = Sharpe × σ', 'Beta = excess return ÷ Treynor', 'Equity changes by beta × market move', 'Cash falls by expenses', 'Add the two parts'] },
      { q: 'Hedge fund fee', items: ['Fixed fee on assets', 'New value = assets × (1 + return)', 'Excess over the high-water mark', 'Incentive % × excess (nil if negative)', 'Add the two fees'] },
      { q: 'Plan-wise yield', items: ['Build the units table for each plan', 'Reinvestment, bonus and growth units to the redemption date', 'Value = closing units × closing NAV', 'Deduct STT and tax if given', 'Annual return = gain ÷ investment × 12 ÷ months'] },
      { q: 'Constant ratio plan', items: ['Check the NAV move against the trigger', 'Total value = bonds + units × NAV', 'Target each side = total × ratio', 'Buy or sell the units needed'] },
      { q: 'Dividend equalisation', items: ['Income per unit to date', 'Issue price = NAV + load + income', 'Repurchase price = NAV − load + income', 'Closing NAV from net assets and units'] },
    ],
  },
];
