// ICAI's own "what changed for Nov 2026" text (Part I of the Nov 2026 RTP), built by scripts/lastday/updates.py.
import updates from '../data/lastday/updates.json';

export interface Updates { source: string; url: string; text: string }
export const updatesOf = (subject: string): Updates | undefined => (updates as unknown as Record<string, Updates>)[subject];

// Packs whose standard is named in the FR Nov 2026 amendments (Ind AS 1, 7, 12, 21 and 107 disclosures), by pack id.
export const AFFECTED_FR = [/-ind-as-1-/, /-ind-as-7-/, /-ind-as-12-/, /-ind-as-21-/, /^chapter-11$/];
export const packAffected = (subject: string, id: string) => subject === 'fr' && AFFECTED_FR.some(r => r.test(id));
