const num = (ask, ans, unit, say, note, tol) => ({ kind: 'num', ask, ans, unit, say, note, ...(tol !== undefined ? { tol } : {}) });
const pick = (ask, opts, pickIx, say, note) => ({ kind: 'pick', ask, opts, pickIx, say, note });

export default [
  {
    id: 's-govco', title: 'Is it a government company?', p: 'psu-cat',
    tip: 'Add the Central and State holdings first, then compare with 51%. A subsidiary of a government company is one too. Listing does not change the status.',
    variants: [
      { label: 'Base case', q: '<p>A company\'s paid-up capital is held: Central Government 30%, State Government 25%, public 45%.</p>',
        steps: [
          num('Government holding (%).', 55, '%', '30 + 25 = <strong>55%</strong>.', 'Govt holding 55%'),
          pick('Government company?', ['Yes: 55% is at least 51%', 'No'], 0, 'Not less than 51% held by the Centre, States or both: a government company.', 'Yes'),
        ] },
      { label: 'Twist 1: just short', q: '<p>Central 30%, State 20%, public 50%.</p>',
        steps: [
          num('Government holding (%).', 50, '%', '30 + 20 = <strong>50%</strong>.', 'Govt holding 50%'),
          pick('Government company?', ['Yes', 'No: 50% is below 51%'], 1, 'Below 51%: not a government company on shareholding.', 'No'),
        ] },
      { label: 'Twist 2: listed', q: '<p>Government holds 55% and the shares are now listed on a stock exchange.</p>',
        steps: [pick('Does the C&AG\'s role continue?', ['No, listed companies are outside it', 'Yes: still a government company while the Government holds at least 51%'], 1, 'Listing or disinvestment does not change the status while the Government holds at least 51%.', 'Yes')] },
    ],
  },
  {
    id: 's-cag-term', title: 'The C&AG\'s term of office', p: 'cag-const',
    tip: 'Add 6 to the age at appointment. If the sum is 65 or less the term is the full 6 years. If it exceeds 65, serve only until 65.',
    variants: [
      { label: 'Base case', q: '<p>A person is appointed C&AG at age 58.</p>',
        steps: [
          num('Age at the end of 6 years.', 64, 'years', '58 + 6 = <strong>64</strong>, below 65.', 'Age after 6 yrs = 64'),
          num('Years actually served.', 6, 'years', 'The earlier of 6 years and age 65: 64 comes first, so the full <strong>6 years</strong>.', 'Serves 6 years'),
        ] },
      { label: 'Twist 1: older appointee', q: '<p>A person is appointed at age 62.</p>',
        steps: [
          num('Age at the end of 6 years.', 68, 'years', '62 + 6 = <strong>68</strong>, beyond 65.', 'Age after 6 yrs = 68'),
          num('Years actually served.', 3, 'years', 'Until age 65: 65 − 62 = <strong>3 years</strong> (whichever is earlier).', 'Serves 3 years'),
        ] },
    ],
  },
  {
    id: 's-supp', title: 'The 60-day supplementary audit window', p: 'govco-sections',
    tip: 'Count the days left in the month you start, then add whole months. 60 days from 10 January: 21 days to end of January, 28 in February (non-leap), that is 49, so 11 more into March.',
    variants: [
      { label: 'Base case', q: '<p>The C&AG receives a government company\'s audit report on 10 January 2026. Under s.143(6)(a) he may conduct a supplementary audit within 60 days of receiving it.</p>',
        steps: [
          num('Days remaining in January after the 10th.', 21, 'days', '31 − 10 = <strong>21</strong>.', 'Jan: 21 days'),
          num('Days used up to the end of February (2026 is not a leap year).', 49, 'days', '21 + 28 = <strong>49</strong>.', 'To 28 Feb: 49 days'),
          num('Date in March on which the 60 days end.', 11, 'March', '60 − 49 = <strong>11</strong>, so 11 March 2026.', 'Window ends 11 March'),
        ] },
    ],
  },
  {
    id: 's-vacancy', title: 'Casual vacancy: who fills it by when?', p: 'govco-sections',
    tip: 'Two windows back to back: 30 days for the C&AG, then 30 days for the Board. The second starts when the first ends.',
    variants: [
      { label: 'Base case', q: '<p>A casual vacancy arises in the auditor\'s office of a government company on 1 March. The C&AG does not act.</p>',
        steps: [
          num('Last day of the C&AG\'s window (day of March).', 31, 'March', '1 March + 30 days = <strong>31 March</strong>.', 'C&AG window ends 31 March'),
          num('Last day of the Board\'s window (day of April).', 30, 'April', 'The next 30 days: to <strong>30 April</strong>.', 'Board window ends 30 April'),
        ] },
      { label: 'Twist: C&AG acts', q: '<p>Same, but the C&AG appoints an auditor on 20 March.</p>',
        steps: [pick('Can the Board appoint after 20 March?', ['Yes, in the next 30 days', 'No: the C&AG acted within his 30 days'], 1, 'The Board\'s power arises only if the C&AG does not fill the vacancy within 30 days.', 'No')] },
    ],
  },
];
