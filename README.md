# H000006 MID

HTML/browser preview of the Monetary Incentive Delay task built with `psyflow-web`.
The within-trial procedure, timing, controller, and instruction text are aligned to the local `T000006-mid` task; only the block/trial count is shortened for preview use.

## Layout

This task follows the same TAPS-style separation used by `psyflow` tasks:

- `main.ts`: task-level orchestration
- `config/config.yaml`: declarative task config
- `src/run_trial.ts`: trial-level logic
- `src/controller.ts`: adaptive response-window controller
- `src/utils.ts`: task-specific helpers

## Run

From [psyflow-web](/e:/xhmhc/TaskBeacon/psyflow-web):

```powershell
npm install
npm run dev:mid
```

Or open the shared runner directly:

```text
http://127.0.0.1:4173/?task=H000006-mid
```
