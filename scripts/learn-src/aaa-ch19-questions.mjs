// App-written questions that close the "no provision left untested" gap in AAA Ch 19 (rule 3a of the ca-chapter skill).
// Facts come only from the provision text in data/aaa/ch19-casebook.json.
const S = 'Exam-style (app-written)';
export const questions = [
  {
    id: 'E37', k: 'app', v: 'Not guilty', src: S, links: ['coe-fp'],
    q: '<p>CA Ravi discovers that a return he helped prepare and which the client has already filed contains a materially misleading statement that the client supplied negligently. Ravi issues a modified report. Has he breached the fundamental principle of integrity? What else must he do?</p>',
    a: '<p><strong>Provision:</strong> Code of Ethics, Subsection 111 (integrity): a professional accountant shall not knowingly be associated with reports or returns containing materially false or misleading statements, including statements provided negligently, or that omit or obscure required information.</p><p><strong>Analysis:</strong> The statement was materially misleading, so association is the concern. The Code says there is <strong>no breach if a modified report is issued</strong>, and that once aware of the association the accountant must <strong>take steps to be disassociated</strong>.</p><p><strong>Conclusion:</strong> Ravi is <strong>not in breach</strong> by issuing the modified report, but he must still take steps to disassociate himself from the misleading return.</p>',
    trap: '<p>Stopping at "modified report, so no breach". The duty to take steps to be disassociated continues.</p>',
  },
  {
    id: 'E38', k: 'app', v: 'Theory', src: S, links: ['s20'],
    q: '<p>A member\'s name was removed from the Register on 15 June 2025 for non-payment of the prescribed fee. On 20 September 2025 (same year) he applies for restoration and pays the arrears. (a) What must he pay? (b) From which date is his membership restored? (c) Would the answer differ if he applied in 2026?</p>',
    a: '<p><strong>Provision:</strong> Section 20 of the CA Act, 1949 read with Regulation 19.</p><p><strong>(a)</strong> A member removed for non-payment may be re-entered on paying the arrears of the <strong>annual fee, entrance fee and additional fee</strong>.</p><p><strong>(b)</strong> Where the application and fees are received in the <strong>same year of removal</strong>, restoration is <strong>from the date of removal</strong> (15 June 2025).</p><p><strong>(c)</strong> In other cases restoration is <strong>from the date the application and fee are received</strong>. Where removal was under an order of the Board of Discipline, Disciplinary Committee, Appellate Authority or High Court, restoration follows that order.</p>',
    trap: '<p>Treating the restoration date as always the date of payment.</p>',
  },
  {
    id: 'E39', k: 'app', v: 'Guilty', src: S, links: ['fs1-5', 'fs1-6'],
    q: '<p>CA Sunil engages Mr Kapoor, who is neither his employee nor his partner, to approach companies and obtain audit appointments for Sunil\'s firm. Separately, a salaried employee of Sunil telephones listed companies and offers the firm\'s audit services. Comment.</p>',
    a: '<p><strong>Provision:</strong> First Schedule, Part I, Clause (5): a CA is guilty if he secures professional business through a person who is not his employee or partner, or by means not open to a chartered accountant. Acts of employees to secure work are themselves subject to Clauses (6) and (7).</p><p><strong>Analysis:</strong> Mr Kapoor is neither employee nor partner, and the proviso covers only arrangements allowed under Clauses (2), (3) and (4). The employee\'s telephone solicitation is soliciting under Clause (6).</p><p><strong>Conclusion:</strong> Sunil is <strong>guilty</strong> of professional misconduct under Clause (5) of Part I of the First Schedule, and the solicitation also engages Clause (6).</p>',
    trap: '<p>Citing only Clause (6). Using a non-employee to get work is Clause (5).</p>',
  },
  {
    id: 'E40', k: 'app', v: 'Partly', src: S, links: ['fs3-3'],
    q: '<p>A CA firm with 6 partners responds to a tender and states that it has 12 partners, knowing the figure is false. In its website write-up the same firm mistakenly prints "6 partners" as "9 partners" because of a typing error; nobody at the firm noticed. Comment on each.</p>',
    a: '<p><strong>Provision:</strong> First Schedule, Part III, Clause (3): a member is guilty if, while inviting work from another CA, responding to tenders or enquiries, or advertising through a write-up, he gives information <strong>knowing it to be false</strong>.</p><p><strong>Analysis:</strong> (a) The tender statement was made knowing it was false, so the clause applies. (b) The typing error was unnoticed and not made knowingly, so the knowledge element is missing.</p><p><strong>Conclusion:</strong> <strong>Partly</strong>: guilty under Clause (3) of Part III of the First Schedule for the tender; not guilty on the write-up error, though the firm should correct it promptly.</p>',
    trap: '<p>Treating every wrong figure as misconduct. The clause needs knowledge of falsity.</p>',
  },
  {
    id: 'E41', k: 'app', v: 'Guilty', src: S, links: ['g-removal', 'ss2-1'],
    q: '<p>The Council has directed that members should not accept appointment as auditor of X Ltd because the earlier auditor was removed unjustifiably. CA Rao reads the earlier auditor\'s statement of reasons filed with the Institute, is unconvinced by it, and accepts the appointment. Comment.</p>',
    a: '<p><strong>Provision:</strong> Council guideline (Chapter XI): an incoming auditor shall follow a direction of the Council or an appropriate Committee not to accept the appointment where the earlier auditor was removed unjustifiably. Breach of a Council guideline is misconduct under Clause (1) of Part II of the Second Schedule.</p><p><strong>Analysis:</strong> A direction exists. The incoming auditor may obtain and consider the statement of reasons through the Ethical Standards Board procedure, but the direction binds him whatever his personal view of the reasons.</p><p><strong>Conclusion:</strong> CA Rao is <strong>guilty</strong> under Clause (1) of Part II of the Second Schedule.</p>',
    trap: '<p>Thinking the incoming auditor may override the direction after reading the statement of reasons.</p>',
  },
  {
    id: 'E42', k: 'app', v: 'Partly', src: S, links: ['g-logo', 'ss2-1'],
    q: '<p>A firm uses the CA India logo exactly as published on a white background on its letterhead. On its visiting cards it uses a modified logo with the firm\'s own monogram placed inside it, rotated slightly. Comment.</p>',
    a: '<p><strong>Provision:</strong> Council logo guidelines (Chapter XVI): members may use the CA India logo as published; no alteration of font, colour, spacing or proportion; no rotation or distortion; <strong>firm logos or monograms of any kind are prohibited</strong>. A breach is misconduct through Clause (1) of Part II of the Second Schedule.</p><p><strong>Analysis:</strong> The letterhead use is as published, so it is permitted. The visiting-card version alters the logo, rotates it and adds a monogram.</p><p><strong>Conclusion:</strong> <strong>Partly</strong>: not guilty for the letterhead; guilty for the visiting cards under Clause (1) of Part II of the Second Schedule.</p>',
    trap: '<p>Treating a firm monogram as harmless branding. Firm logos and monograms of any kind are prohibited.</p>',
  },
];
