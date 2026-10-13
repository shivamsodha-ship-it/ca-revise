export const compare = {
  title: 'Performance vs Propriety audit',
  cols: ['Performance audit', 'Propriety audit'],
  rows: [
    { d: 'Core question', a: 'Were economy, efficiency and effectiveness achieved? Value for money?', b: 'Was the expenditure in the public interest and consistent with accepted customs and standards of conduct?', p: 'perf-audit' },
    { d: 'Tests', a: 'The three Es', b: 'Kohler: public interest, commonly accepted customs, standards of conduct', p: 'propriety' },
    { d: 'Rules compliance', a: 'Non-compliance may be a cause or consequence of performance.', b: 'Looks at spending even when it conforms to rules.', p: 'propriety' },
    { d: 'Accountability', a: 'Managerial accountability', b: 'Fiscal accountability (with compliance)', p: 'psu-scope' },
    { d: 'Engagement type', a: 'Generally direct reporting', b: 'Judgement against norms of propriety', p: 'engagement-types' },
    { d: 'Typical examples', a: 'Delayed modernisation; cost per job created; DBT scheme design', b: 'A building never used for its purpose (infructuous); a school used five years late (avoidable)', p: 'propriety' },
    { d: 'Main difficulty', a: 'Choosing criteria and approach (Audit Design Matrix)', b: 'Subjectivity of "propriety"; judge without hindsight', p: 'propriety-issues' },
    { d: 'Part of comprehensive audit', a: 'Yes', b: 'Standards of financial propriety are among its criteria', same: true, p: 'comprehensive' },
  ],
  sorter: [
    { s: 'Examines whether economy, efficiency and effectiveness were achieved.', ans: 0, why: 'The three Es define performance audit.' },
    { s: 'Applies the tests of public interest, accepted customs and standards of conduct.', ans: 1, why: 'Kohler\'s tests for propriety audit.' },
    { s: 'Can criticise expenditure that conforms to existing rules.', ans: 1, why: 'Propriety audit brings out improper, avoidable or infructuous spending even if in conformity with rules.' },
    { s: 'Uses an Audit Design Matrix.', ans: 0, why: 'ADM belongs to performance audit planning.' },
    { s: 'A building constructed for a telephone exchange is never used for it.', ans: 1, why: 'Infructuous expenditure: propriety.' },
    { s: 'Cost per job created compared with other programmes.', ans: 0, why: 'An efficiency question: performance audit.' },
    { s: 'Judge decisions in the circumstances when they were taken, not on hindsight.', ans: 1, why: 'Propriety audit\'s answer to subjectivity.' },
    { s: 'May be combined with compliance audit when non-compliance explains poor results.', ans: 0, why: 'Compliance audit may be combined with performance audit.' },
    { s: 'Is part of comprehensive audit.', ans: 2, why: 'Both feed comprehensive audit.' },
    { s: 'Is performed only by the Estimates Committee.', ans: 3, why: 'Neither: the C&AG (SAI) performs these audits; the Estimates Committee examines estimates.' },
  ],
};

export const games = [
  {
    id: 'g-numbers', type: 'match', title: 'Numbers and counts', intro: 'Six random pairs each round.',
    pairs: [
      ['Government company shareholding', 'not less than 51%'], ['C&AG term', '6 years or age 65'], ['Supplementary audit window', '60 days'],
      ['Casual vacancy: C&AG then Board', '30 days, then 30 days'], ['General principles of PSU audit', '8'], ['Planning steps for performance audit', '9 (A to I)'],
      ['Sources for understanding the entity', '7'], ['Sources of audit criteria', '6'], ['Audit approach methods', '6'],
      ['Principles of financial propriety', '4'], ['Issues in comprehensive audit', '10 (a to j)'], ['Audit Design Matrix columns', '5'], ['Parts of the C&AG report on PSUs', '4'],
    ],
  },
  {
    id: 'g-audit-type', type: 'sort', title: 'Which audit?', intro: 'Read the cue and pick the audit.',
    buckets: ['Financial', 'Compliance', 'Performance', 'Propriety'],
    items: [
      { t: 'An opinion on whether the financial statements give a true and fair view', b: 0 }, { t: 'Buildings wrongly classified as flats, water charges under-collected', b: 1 },
      { t: 'An insurance PSU issuing policies without required approvals', b: 1 }, { t: 'A steel PSU\'s modernisation delayed, missing market conditions', b: 2 },
      { t: 'Is the programme economical, efficient and effective?', b: 2 }, { t: 'Expense within the rules but wasteful or infructuous', b: 3 },
      { t: 'Checking expenses against public interest and accepted customs', b: 3 }, { t: 'Always an attestation engagement', b: 0 },
      { t: 'Regularity plus propriety', b: 1 }, { t: 'Cost per job created compared with other schemes', b: 2 },
    ],
  },
  {
    id: 'g-committee', type: 'sort', title: 'Which committee?', intro: 'PAC, Estimates Committee or COPU.',
    buckets: ['PAC', 'Estimates Committee', 'COPU'],
    items: [
      { t: 'Checks that money was legally disbursed on the intended purpose', b: 0 }, { t: 'Checks that expenditure was authorised', b: 0 }, { t: 'Checks re-appropriation was made as provided', b: 0 },
      { t: 'Suggests economies and administrative reform on the estimates', b: 1 }, { t: 'Suggests alternative policies', b: 1 }, { t: 'Suggests the form in which estimates are presented', b: 1 },
      { t: 'Examines reports and accounts of public undertakings', b: 2 }, { t: 'Examines whether PSUs run on sound business principles', b: 2 }, { t: 'Examines the C&AG\'s reports on public undertakings', b: 2 },
      { t: 'Controls government departments', b: 0 }, { t: 'Examines the autonomy and efficiency of PSUs', b: 2 },
    ],
  },
  {
    id: 'g-three-e', type: 'sort', title: 'Economy, efficiency or effectiveness?', intro: 'The three Es of performance audit.',
    buckets: ['Economy', 'Efficiency', 'Effectiveness'],
    items: [
      { t: 'Did we get consultancy at the best price?', b: 0 }, { t: 'What is the cost of sickness absences?', b: 0 }, { t: 'Resources acquired in due time at the lowest cost', b: 0 },
      { t: 'Input-output ratio: maximum output for minimum input', b: 1 }, { t: 'Cost per job created compared with elsewhere', b: 1 }, { t: 'Sound procurement and maintenance of resources', b: 1 },
      { t: 'Extent to which objectives are achieved', b: 2 }, { t: 'Intended versus actual impact', b: 2 }, { t: 'Are the impacts due to the policy or to other factors?', b: 2 },
    ],
  },
  {
    id: 'g-section', type: 'sort', title: 'Which power of the C&AG?', intro: 'Government company audit: match the power to its section.',
    buckets: ['Appoint (139)', 'Direct (143(5))', 'Supplementary audit (143(6)(a))', 'Comment (143(6)(b))', 'Test audit (143(7))'].slice(0, 4),
    items: [
      { t: 'Appoints or re-appoints the statutory auditor', b: 0 }, { t: 'Tells the auditor how the accounts are to be audited', b: 1 },
      { t: 'The auditor\'s report must state the directions, action taken and impact on accounts', b: 1 }, { t: 'Within 60 days of receiving the report', b: 2 },
      { t: 'Comments go to all entitled to the statements and are placed before the AGM', b: 3 }, { t: 'Supplements the audit report', b: 3 },
      { t: 'Remuneration fixed by the company within C&AG guidelines', b: 0 },
    ],
  },
  {
    id: 'g-engagement', type: 'sort', title: 'Attestation or direct reporting?', intro: 'Who measures the subject matter?',
    buckets: ['Attestation', 'Direct reporting'],
    items: [
      { t: 'Financial audit', b: 0 }, { t: 'Performance audit', b: 1 }, { t: 'Compliance audit (generally)', b: 1 },
      { t: 'The responsible party measures the subject matter against the criteria', b: 0 }, { t: 'The auditor measures or evaluates the subject matter against the criteria', b: 1 },
      { t: 'The auditor gathers evidence to conclude on information the entity presents', b: 0 },
    ],
  },
  {
    id: 'g-twist', type: 'sort', title: 'As written, or twisted?', intro: 'Each statement is either as the SM says or has one fact changed.',
    buckets: ['As written', 'Twisted'],
    items: [
      { t: 'A government company has not less than 51% Government shareholding.', b: 0 }, { t: 'A government company needs more than 75% Government shareholding.', b: 1, why: 'Twisted: 51%.' },
      { t: 'The C&AG\'s term is 6 years or up to age 65, whichever is earlier.', b: 0 }, { t: 'The C&AG is appointed by the Speaker.', b: 1, why: 'Twisted: appointed by the President (Art. 148).' },
      { t: 'The members appoint the auditor of a government company.', b: 1, why: 'Twisted: the C&AG appoints.' }, { t: 'The C&AG may conduct a supplementary audit within 60 days of receiving the report.', b: 0 },
      { t: 'COPU exercises over PSUs the control the PAC exercises over departments.', b: 0 }, { t: 'The PAC examines estimates for economies.', b: 1, why: 'Twisted: that is the Estimates Committee.' },
      { t: 'Financial audit is a direct reporting engagement.', b: 1, why: 'Twisted: always attestation.' }, { t: 'Compliance audit covers regularity and propriety.', b: 0 },
      { t: 'Performance audit planning has nine suggested steps, A to I.', b: 0 }, { t: 'The Audit Design Matrix has three columns.', b: 1, why: 'Twisted: five.' },
      { t: 'Propriety audit only looks at expenditure that breaks the rules.', b: 1, why: 'Twisted: it also looks at spending in conformity with rules that is wasteful.' },
    ],
  },
  {
    id: 'g-order', type: 'order', title: 'Put it in order', intro: 'Sequences from the chapter.',
    rounds: [
      { q: 'Articles 148 to 151', items: ['148: appointment', '149: duties and powers', '150: form of accounts', '151: reports laid before Parliament'] },
      { q: 'Performance audit planning, steps A to D', items: ['Understand the entity', 'Define objectives and scope', 'Determine audit criteria', 'Decide the audit approach'] },
      { q: 'Performance audit cycle', items: ['Strategic planning', 'Planning individual audits', 'Implementation: preliminary study, field audit, draft report', 'Report approval', 'Performance audit report', 'Follow-up and impact assessment'] },
      { q: 'Compliance audit process', items: ['Planning', 'Performing and gathering evidence', 'Evaluating evidence and forming conclusions', 'Reporting', 'Follow-up'] },
      { q: 'Parts of the C&AG report on PSUs', items: ['Review', 'Appraisals by the Audit Board', 'Resume of auditors\' reports', 'Results of other audits'] },
      { q: 'Casual vacancy in a government company\'s audit', items: ['Vacancy arises', 'C&AG fills it within 30 days', 'If not, Board fills it within the next 30 days'] },
    ],
  },
];
