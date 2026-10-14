// FR Ch 9 — compare (licence: right to access vs right to use) and games. Facts from the casebook.
export const compare = {
  title: 'Licence of IP: right to access vs right to use',
  cols: ['Right to access (over time)', 'Right to use (point in time)'],
  rows: [
    { d: 'What the customer gets', a: 'The IP as it exists throughout the licence period', b: 'The IP as it exists when the licence is granted', p: 'r115-licence' },
    { d: 'Entity\'s ongoing activities', a: 'Required or reasonably expected, and significantly affect the IP', b: 'None that significantly affect the IP (IP is static or has stand-alone functionality)', p: 'r115-licence' },
    { d: 'Customer exposure', a: 'Exposed to the positive or negative effects of those activities', b: 'Not exposed — benefit does not depend on the entity', p: 'r115-licence' },
    { d: 'Are the activities separate goods/services?', a: 'No — they do not transfer anything separately', b: 'If they are (e.g. distinct upgrades) they are ignored in judging the licence', p: 'r115-licence' },
    { d: 'Revenue pattern', a: 'Over time, across the licence period', b: 'At the point the customer can use and benefit from the IP', p: 'r115-licence' },
    { d: 'SM examples', a: 'Chhota Bheem character licence; sports team name while playing; franchise with brand maintenance', b: '1975 symphony recording; completed film; software with when-and-if-available upgrades; dormant brand from a brand collector', p: 'r115-licence' },
    { d: 'Sales-based royalty', a: 'Recognised when the later of sale/usage and satisfaction occurs', b: 'Recognised when the later of sale/usage and satisfaction occurs', p: 'r115-royalty', same: true }
  ],
  sorter: [
    { s: 'Franchisor must keep maintaining the brand through marketing and product improvements.', ans: 0, why: 'Activities significantly affect the IP and expose the franchisee (SM PQ 4).' },
    { s: 'Licence of a 1975 classical recording for use in advertisements.', ans: 1, why: 'Significant stand-alone functionality; no obligation to change it (SM Illustration 69).' },
    { s: 'Film studio will market a completed film heavily.', ans: 1, why: 'Marketing does not change the film\'s form or functionality (SM Illustration 71).' },
    { s: 'Team name and logo licensed while the team keeps playing games.', ans: 0, why: 'Value depends on the team\'s ongoing activities (SM Illustration 72(i)).' },
    { s: 'Revenue from a sales-based royalty waits for the customer\'s sales.', ans: 2, why: 'The royalty exception applies to both kinds of licence.' },
    { s: 'Payment is made monthly over two years, so revenue must be over time.', ans: 3, why: 'Payment terms do not decide the nature of the licence (SM Illustration 69 is paid monthly but is a right to use).' }
  ]
};

export const games = [
  { id: 'g-finder', type: 'match', title: 'Fact → paragraph', intro: 'Match each fact pattern to the Ind AS 115 requirement that decides it.',
    pairs: [
      ['Customer can cancel without penalty after 3 months', 'Contract term (paras 11–12)'],
      ['Extra units added at their stand-alone price', 'Modification as a separate contract'],
      ['40% voucher when everyone gets 10%', 'Material right (B39–B43)'],
      ['Elevators delivered six months before installation', 'Uninstalled materials (B19)'],
      ['Customer pays but asks the entity to store the spares', 'Bill-and-hold (B79–B82)'],
      ['Entity may buy the asset back at a higher price', 'Repurchase: financing'],
      ['Payment 24 months after delivery at a higher price', 'Significant financing component'],
      ['Shelving payment to a retail chain', 'Consideration payable to a customer']
    ] },
  { id: 'g-separate', type: 'sort', title: 'Separate performance obligation or not?', intro: 'Sort each promise.', buckets: ['Separate performance obligation', 'Not separate'],
    items: [
      { t: 'Modem sold with broadband where customers can buy modems elsewhere', b: 0, why: 'SM Illustration 11.' },
      { t: 'Telecom activation fee', b: 1, why: 'No service transferred (SM Illustration 28).' },
      { t: 'Critical anti-virus updates with the licence', b: 1, why: 'Inputs to a combined output (SM Illustration 18).' },
      { t: 'Two years of free maintenance advertised by a carmaker', b: 0, why: 'Implied promise (SM Illustration 21).' },
      { t: 'Extended warranty the customer can buy separately', b: 0, why: 'Service-type warranty (SM Illustration 35).' },
      { t: 'Basic 90-day assurance warranty', b: 1, why: 'Ind AS 37 provision.' },
      { t: 'Custodial service for spares in a bill-and-hold', b: 0, why: 'SM Illustration 68.' },
      { t: 'Golf membership sold with a property', b: 0, why: 'SM PQ 6.' },
      { t: 'Construction services and materials in a building contract', b: 1, why: 'Significant integration (SM PQ 6).' },
      { t: 'Stand-ready promise to accept returns', b: 1, why: 'Not a performance obligation in addition to the refund (para B21).' }
    ] },
  { id: 'g-over-time', type: 'sort', title: 'Over time or point in time?', intro: 'Decide how control transfers.', buckets: ['Over time', 'Point in time'],
    items: [
      { t: 'Monthly payroll processing', b: 0, why: '35(a) (SM Illustration 59).' },
      { t: 'Sea voyage Mumbai to Colombo', b: 0, why: 'No re-performance needed (SM Illustration 60).' },
      { t: 'Audit opinion with right to cost + 15% on termination', b: 0, why: '35(c) (SM Illustration 61).' },
      { t: 'Equipment where only payments already received are kept on termination', b: 1, why: 'No enforceable right to payment for work to date (SM Illustration 63).' },
      { t: 'Health club access for a year', b: 0, why: 'Straight-line over time (SM Illustration 64).' },
      { t: '1975 symphony recording licence', b: 1, why: 'Right to use (SM Illustration 69).' }
    ] },
  { id: 'g-catchup', type: 'order', title: 'Put the working in order', intro: 'Arrange the steps ICAI expects.',
    rounds: [
      { q: 'Cumulative catch-up on a modification', items: ['Add original and modification prices', 'Divide by revised total units to get the blended rate', 'Multiply the blended rate by work done to date', 'Subtract revenue already booked', 'Recognise the difference in the current period'] },
      { q: 'Allocating a material-right voucher', items: ['Identify the incremental discount', 'Estimate the voucher\'s SSP: spend × discount × likelihood', 'Add the SSPs of the product and the voucher', 'Allocate the price in proportion to SSPs', 'Recognise voucher revenue on redemption or expiry'] },
      { q: 'Sale with a right of return', items: ['Estimate units expected to be returned', 'Recognise revenue on units expected to be kept', 'Recognise a refund liability for expected returns', 'Recognise an asset for goods to be recovered, at cost less recovery costs', 'Update estimates at each reporting date'] }
    ] }
];
