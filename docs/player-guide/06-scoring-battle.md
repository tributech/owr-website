---
title: "Scoring — Battle Results"
slug: scoring-battle
order: 6
url_path: /au/tournaments/{slug}/hub
screenshot: 06-scoring-battle.png
detail_screenshots:
  - 06-scoring-battle-form.png
section: scoring
description: "Enter Victory Points, battle objectives, and submit your game result"
---

# Scoring — Battle Results

After your game finishes and the round enters the **Active** or **Scoring** state, either player can submit the match result from the Battle Hub.

![Score entry button](./06-scoring-battle.png)

## Submitting a Score

On the **Match** tab, click the **Enter Score** button below the player cards. This opens the score entry form.

The form header reminds you: "Enter the result for both players. Your opponent will confirm."

![Score entry form](./06-scoring-battle-form.png)

### Step 1: Enter Victory Points

Two side-by-side input fields appear:

- **Your VP** — The Victory Points you scored
- **Opponent VP** — The Victory Points your opponent scored

You enter both values. At least one VP must be non-zero before you can submit.

### Step 2: Outcome Calculation

How the result is determined depends on the scoring mode the TO has configured:

#### Win-Loss-Draw (WLD) Mode

The outcome is calculated automatically from VP comparison:
- Higher VP = **Win**
- Lower VP = **Loss**
- Equal VP = **Draw**

A read-only result indicator shows the derived outcome (W, L, or D) below the VP fields. You don't need to select it — it's worked out from the numbers.

#### Differential Mode

VP differential determines base Tournament Points (TP) using a conversion table. For example, using the standard Matched Play table:

| VP Differential | Winner Result | Winner TP | Loser Result | Loser TP |
|----------------|--------------|-----------|-------------|----------|
| 0 – 300 | Draw | 3 | Draw | 3 |
| 301 – 600 | Minor Victory | 4 | Minor Loss | 2 |
| 601 – 950 | Regular Victory | 5 | Regular Loss | 1 |
| 951+ | Crushing Victory | 6 | Crushing Loss | 0 |

After entering VP, a line shows the base Battle Points from the VP differential — e.g., "VP Differential: 5 - 1 BP".

### Step 3: Battle Objectives (If Configured)

If the TO has set up battle criteria (scenario objectives, secondary missions, etc.), two additional sections appear below the VP fields:

- **Your Battle Objectives** — Score your own objective achievements
- **Opponent's Battle Objectives** — Score your opponent's objective achievements

Each objective may have multiple criteria to tick off or score. The input type depends on how the TO configured them:

- **Rubric** — A checklist of items worth set points each. Tick the ones achieved.
- **Numeric** — A single number input with a min-max range.

### Step 4: Calculated Result Preview

In Differential mode, after entering VP and battle objectives, a **Calculated Result** section appears showing the full breakdown:

- Base BP from VP differential
- Bonus BP from battle objectives
- **Total TP** for each player
- Final **outcome** (win/loss/draw) based on total TP comparison

This lets you verify the result before submitting.

### Step 5: Submit

Click **Submit Score** to send the result. Both your scores and your opponent's scores are submitted together in one go.

After submitting, you'll enter the confirmation flow — see the next guide for what happens next.

## Editing Before Confirmation

If you realise you made a mistake, you can edit your submission before your opponent confirms. See [Scoring — Confirm & Edit](./07-scoring-confirm.md) for details.
