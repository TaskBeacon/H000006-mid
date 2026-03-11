import {
  set_trial_context,
  type StimBank,
  type TaskSettings,
  type TrialBuilder,
  type TrialSnapshot
} from "psyflow-web";

import type { Controller } from "./controller";
import * as utils from "./utils";

export function run_trial(
  trial: TrialBuilder,
  condition: string,
  context: {
    settings: TaskSettings;
    stimBank: StimBank;
    controller: Controller;
    utils: typeof utils;
  }
): TrialBuilder {
  const { settings, stimBank, controller } = context;
  const keyList = (settings.key_list as string[]) ?? ["space"];
  const delta = Number(settings.delta ?? 10);
  const resolveTargetDuration = () => controller.get_duration(condition);

  trial
    .unit("cue")
    .addStim(stimBank.get(`${condition}_cue`))
    .show({ duration: Number(settings.cue_duration ?? 0.3) })
    .to_dict();

  const anticipation = trial.unit("anticipation").addStim(stimBank.get("fixation"));
  set_trial_context(anticipation, {
    trial_id: trial.trial_id,
    phase: "anticipation_fixation",
    deadline_s: (settings.anticipation_duration as number | number[] | null | undefined) ?? null,
    valid_keys: [...keyList],
    block_id: trial.block_id,
    condition_id: condition,
    task_factors: {
      condition,
      stage: "anticipation_fixation",
      trial_index: trial.trial_index,
      block_id: trial.block_id
    },
    stim_id: "fixation"
  });
  anticipation
    .captureResponse({
      keys: keyList,
      duration: (settings.anticipation_duration as number | number[] | null | undefined) ?? null,
      correct_keys: keyList,
      terminate_on_response: false
    })
    .set_state({
      early_response: anticipation.ref("response")
    })
    .to_dict();

  const target = trial.unit("target").addStim(stimBank.get(`${condition}_target`));
  set_trial_context(target, {
    trial_id: trial.trial_id,
    phase: "target_response_window",
    valid_keys: [...keyList],
    block_id: trial.block_id,
    condition_id: condition,
    task_factors: {
      condition,
      stage: "target_response_window",
      trial_index: trial.trial_index,
      block_id: trial.block_id
    },
    stim_id: `${condition}_target`
  });
  target
    .captureResponse({
      keys: keyList,
      duration: () => resolveTargetDuration(),
      correct_keys: keyList,
      grace_s: Number(settings.response_grace_s ?? 0)
    })
    .set_state({
      target_duration_s: () => resolveTargetDuration()
    })
    .to_dict();

  trial
    .unit("prefeedback_fixation")
    .addStim(stimBank.get("fixation"))
    .show({
      duration: (settings.prefeedback_duration as number | number[] | null | undefined) ?? null
    })
    .to_dict();

  trial
    .unit("feedback")
    .addStim((snapshot: TrialSnapshot) => {
      const outcome = utils.resolveMidOutcome(snapshot, condition, delta);
      return stimBank.get(`${condition}_${outcome.hit_type}_feedback`);
    })
    .show({ duration: Number(settings.feedback_duration ?? 1) })
    .set_state({
      hit: (snapshot: TrialSnapshot) => utils.resolveMidOutcome(snapshot, condition, delta).hit,
      delta: (snapshot: TrialSnapshot) => utils.resolveMidOutcome(snapshot, condition, delta).delta,
      hit_type: (snapshot: TrialSnapshot) => utils.resolveMidOutcome(snapshot, condition, delta).hit_type
    })
    .to_dict();

  trial.finalize((snapshot) => {
    controller.update(Boolean(snapshot.units.feedback?.hit), condition);
  });

  return trial;
}
