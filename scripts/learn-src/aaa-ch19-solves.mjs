const num = (ask, ans, unit, say, note, tol) => ({ kind: 'num', ask, ans, unit, say, note, ...(tol !== undefined ? { tol } : {}) });
const pick = (ask, opts, pickIx, say, note) => ({ kind: 'pick', ask, opts, pickIx, say, note });

export default [
  {
    id: 's-tax', title: 'Count the tax audits', p: 'g-taxaudit',
    tip: 'Add every tax audit report he signed in the year across all capacities. Take out s.44AD/44ADA/44AE audits and revised reports. Then compare with 60. Never divide or share the limit between partners.',
    variants: [
      { label: 'Base case', q: '<p>CA X signs, in one financial year: 12 tax audits as proprietor, 20 as partner in firm P and 25 as partner in firm Q.</p>',
        steps: [
          num('Total tax audit reports signed.', 57, 'reports', '12 + 20 + 25 = <strong>57</strong>.', 'Total 12+20+25 = 57'),
          pick('Within the limit of 60?', ['Yes', 'No'], 0, '57 is not more than 60: <strong>within the limit</strong>.', 'Within 60'),
        ] },
      { label: 'Twist 1: one more firm', q: '<p>Same CA also signs 6 reports as partner in firm R.</p>',
        steps: [
          num('Total reports.', 63, 'reports', '57 + 6 = <strong>63</strong>.', 'Total 63'),
          num('Excess over 60.', 3, 'reports', '63 − 60 = <strong>3</strong>.', 'Excess 3'),
          pick('Verdict?', ['Not guilty', 'Guilty: the limit is an aggregate'], 1, 'The limit is <strong>an aggregate</strong> across individual and all firms: guilty (GL: Tax audit limit).', 'Guilty'),
        ] },
      { label: 'Twist 2: exclusions', q: '<p>Of those 63 reports, 5 are audits under s.44AB for persons covered by s.44ADA, and 2 are revised reports.</p>',
        steps: [
          num('Reports counted after exclusions.', 56, 'reports', '63 − 5 − 2 = <strong>56</strong>.', 'Counted 63−5−2 = 56'),
          pick('Verdict?', ['Guilty', 'Not guilty: 56 is within 60'], 1, '44AD/44ADA/44AE audits and revised reports are not counted. 56 is within 60.', 'Not guilty'),
        ] },
      { label: 'Twist 3: firm limit', q: '<p>A 4-partner firm signs 200 tax audits in total. One partner, CA Chetan, signs 68 of them.</p>',
        steps: [
          num('The firm\'s notional pooled limit if it were shareable (4 × 60).', 240, 'reports', '4 × 60 = 240. But the limit cannot be pooled.', 'Pooled 240 (not allowed)'),
          num('Excess of CA Chetan over his own limit.', 8, 'reports', '68 − 60 = <strong>8</strong>.', 'Chetan excess 8'),
          pick('Verdict?', ['Not guilty: the firm is within 240', 'Guilty: 60 applies to each member'], 1, 'The limit is per member and cannot be shared (RTP Nov 2026, MCQ 1).', 'Guilty'),
        ] },
    ],
  },
  {
    id: 's-company', title: 'Count the company audits', p: 'g-audits',
    tip: 'Ceiling = 30 × number of counted partners. Exclude OPCs and dormant companies from the count, and count a head office with its branches as one. Part-time practising partners are not counted.',
    variants: [
      { label: 'Base case', q: '<p>A firm has 3 partners, one of whom is a part-time practising partner. It holds 68 company audits, including 5 One Person Companies and 3 dormant companies. SM figure: 30 per partner.</p>',
        steps: [
          num('Partners counted.', 2, 'partners', '3 − 1 part-time = <strong>2</strong>.', 'Counted partners 2'),
          num('The firm\'s ceiling.', 60, 'audits', '2 × 30 = <strong>60</strong>.', 'Ceiling 60'),
          num('Company audits counted (exclude OPCs and dormant).', 60, 'audits', '68 − 5 − 3 = <strong>60</strong>.', 'Counted 68−5−3 = 60'),
          pick('Can it accept one more company audit?', ['Yes', 'No: it would exceed 60'], 1, 'It is at the ceiling of 60; one more makes 61.', 'No: at ceiling'),
        ] },
      { label: 'Twist 1: new partner', q: '<p>On the date of acceptance of a new audit, a third full-time partner has joined (so 3 counted partners).</p>',
        steps: [
          num('New ceiling.', 90, 'audits', '3 × 30 = <strong>90</strong>.', 'Ceiling 90'),
          pick('Can it accept one more?', ['Yes: 61 is within 90', 'No'], 0, 'The number of partners on the date of acceptance counts.', 'Yes'),
        ] },
    ],
  },
  {
    id: 's-nonaudit', title: 'Non-audit fee ceiling', p: 'g-nonaudit',
    tip: 'Add the other fees of the auditor and of his associate concerns, then compare with the statutory audit fee. Leave out other statutory audits, certification the auditor must do, and representation before an authority.',
    variants: [
      { label: 'Base case', q: '<p>A CA is statutory auditor of a listed company (turnover well above ₹50 crore), fee ₹20 lakh. He also earns ₹12 lakh for other services, and his associate concern earns ₹6 lakh from the company.</p>',
        steps: [
          num('Total other-work fee (₹ lakh).', 18, '₹ lakh', '12 + 6 = <strong>18</strong>.', 'Other fees 18 lakh'),
          pick('Within the ceiling of ₹20 lakh?', ['Yes', 'No'], 0, '18 is not more than 20: <strong>within</strong>.', 'Within'),
        ] },
      { label: 'Twist 1: associate bills more', q: '<p>Same, but the associate concern earns ₹10 lakh.</p>',
        steps: [
          num('Total other-work fee (₹ lakh).', 22, '₹ lakh', '12 + 10 = <strong>22</strong>.', 'Other fees 22 lakh'),
          pick('Result?', ['Within the ceiling', 'Exceeds: he should not have accepted the appointment'], 1, '22 exceeds 20. The limit applies to the auditor <strong>and his associate concerns together</strong>.', 'Exceeds'),
        ] },
      { label: 'Twist 2: exclusions', q: '<p>Same as twist 1, but ₹4 lakh of the auditor\'s ₹12 lakh is certification work required to be done by the statutory auditor.</p>',
        steps: [
          num('Fee counted against the ceiling (₹ lakh).', 18, '₹ lakh', '(12 − 4) + 10 = <strong>18</strong>. Certification required of the statutory auditor is not "other work".', 'Counted 18 lakh'),
          pick('Result?', ['Exceeds', 'Within the ceiling'], 1, '18 is within 20.', 'Within'),
        ] },
      { label: 'Twist 3: small public company', q: '<p>Same fees as twist 1, but the company is an unlisted public company with turnover of ₹40 crore.</p>',
        steps: [pick('Does the ceiling apply?', ['Yes', 'No: turnover is below ₹50 crore and it is not a PSU, Government or listed company'], 1, 'The ceiling applies to PSUs, Government companies, listed companies and other public companies with turnover of ₹50 crore or more.', 'Does not apply')] },
      { label: 'Twist 4: network firms', q: '<p>Statutory audit fee ₹20 lakh. Other firms of the auditor\'s network earn ₹55 lakh from the company in total for other services.</p>',
        steps: [
          num('Network ceiling: 3 times the audit fee (₹ lakh).', 60, '₹ lakh', '3 × 20 = <strong>60</strong>.', 'Network ceiling 60 lakh'),
          pick('Within it?', ['Yes', 'No'], 0, '55 is within 60.', 'Within'),
        ] },
    ],
  },
  {
    id: 's-indebt', title: 'Indebtedness limits', p: 'g-indebted',
    tip: 'Decide first: is the concern a company? For a company use the Act (indebtedness above ₹5 lakh; guarantee above ₹1 lakh). For any other concern the guideline figure is above ₹1,00,000.',
    variants: [
      { label: 'Base case', q: '<p>A CA owes a company ₹4 lakh. Can he accept its audit?</p>',
        steps: [
          num('Statutory indebtedness threshold for a company (₹ lakh).', 5, '₹ lakh', 's.141(3)(d)(ii): indebtedness above ₹5 lakh disqualifies. Threshold <strong>₹5 lakh</strong>.', 'Threshold 5 lakh'),
          pick('Can he accept?', ['Yes: ₹4 lakh does not exceed ₹5 lakh', 'No'], 0, '₹4 lakh is within the statutory limit.', 'Yes'),
        ] },
      { label: 'Twist 1: guarantee', q: '<p>The CA gave a guarantee of ₹1.5 lakh for a third person\'s debt to the company.</p>',
        steps: [
          num('Statutory guarantee threshold (₹ lakh).', 1, '₹ lakh', 's.141(3)(d)(iii): guarantee or security above ₹1 lakh. Threshold <strong>₹1 lakh</strong>.', 'Guarantee threshold 1 lakh'),
          pick('Can he accept?', ['Yes', 'No: ₹1.5 lakh exceeds ₹1 lakh'], 1, '₹1.5 lakh exceeds ₹1 lakh: disqualified.', 'No'),
        ] },
      { label: 'Twist 2: not a company', q: '<p>The CA owes ₹1.5 lakh to a partnership firm whose audit he is offered (not a company).</p>',
        steps: [
          pick('Which limit applies?', ['The s.141 company limit of ₹5 lakh', 'The Council guideline: above ₹1,00,000'], 1, 'For concerns other than companies the Council guideline applies: above ₹1,00,000.', 'Guideline ₹1,00,000'),
          pick('Can he accept?', ['Yes', 'No: ₹1.5 lakh exceeds ₹1,00,000'], 1, '₹1.5 lakh exceeds ₹1,00,000.', 'No'),
        ] },
    ],
  },
  {
    id: 's-sick', title: 'Unpaid fee and the sick-unit exception', p: 'g-fees',
    tip: 'Test two things for sickness: registered for at least 5 years, and accumulated losses at least equal to net worth. Both must hold.',
    variants: [
      { label: 'Base case', q: '<p>The previous auditor\'s undisputed fee is unpaid. The company has been registered for 6 years, with net worth ₹10 crore and accumulated losses ₹12 crore.</p>',
        steps: [
          pick('Registered for at least 5 years?', ['Yes', 'No'], 0, '6 years is at least 5.', 'Registered 6 years'),
          pick('Accumulated losses at least equal to net worth?', ['Yes: 12 ≥ 10', 'No'], 0, '₹12 crore is not less than ₹10 crore.', 'Losses ≥ net worth'),
          pick('Can the new auditor accept?', ['Yes: sick unit exception', 'No'], 0, 'It is a sick unit, so the unpaid-fee bar does not apply.', 'Yes (sick unit)'),
        ] },
      { label: 'Twist: young company', q: '<p>Same numbers, but the company was registered 4 years ago.</p>',
        steps: [
          pick('Is it a sick unit?', ['Yes', 'No: not registered for 5 years'], 1, 'The 5-year test fails, even though losses exceed net worth.', 'Not sick'),
          pick('Can the new auditor accept?', ['Yes', 'No: undisputed fee unpaid'], 1, 'Not a sick unit, so accepting would breach the guideline.', 'No'),
        ] },
    ],
  },
];
