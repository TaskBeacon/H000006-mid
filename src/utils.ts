import type { ReducedTrialRow, TrialSnapshot } from "psyflow-web";

export interface MidOutcome {
  hit: boolean;
  delta: number;
  hit_type: "hit" | "miss";
}

export function resolveMidOutcome(
  snapshot: TrialSnapshot,
  condition: string,
  deltaMagnitude: number
): MidOutcome {
  const earlyResponse = Boolean(snapshot.units.anticipation?.early_response);
  const targetHit = Boolean(snapshot.units.target?.hit);
  const hit = earlyResponse ? false : targetHit;
  const rewardIfHit: Record<string, number> = { win: deltaMagnitude, lose: 0, neut: 0 };
  const penaltyIfMiss: Record<string, number> = { win: 0, lose: -deltaMagnitude, neut: 0 };
  return {
    hit,
    delta: hit ? (rewardIfHit[condition] ?? 0) : (penaltyIfMiss[condition] ?? 0),
    hit_type: hit ? "hit" : "miss"
  };
}

export function summarizeBlock(rows: ReducedTrialRow[], blockId: string): {
  accuracy: number;
  total_score: number;
} {
  const blockRows = rows.filter((row) => row.block_id === blockId);
  if (blockRows.length === 0) {
    return { accuracy: 0, total_score: 0 };
  }
  const hits = blockRows.reduce((sum, row) => sum + Number(Boolean(row.feedback_hit)), 0);
  const totalScore = blockRows.reduce((sum, row) => sum + Number(row.feedback_delta ?? 0), 0);
  return {
    accuracy: hits / blockRows.length,
    total_score: totalScore
  };
}
