---
title: "Scoring — Confirm & Edit"
slug: scoring-confirm
order: 7
url_path: /au/tournaments/{slug}/hub
screenshot: 07-scoring-confirm.png
detail_screenshots:
  - 07-scoring-confirm-waiting.png
  - 07-scoring-confirm-review.png
section: scoring
description: "How the two-player confirmation flow works — submitting, reviewing, and confirming match results"
---

# Scoring — Confirm & Edit

OWR uses a two-player confirmation system to make sure both players agree on the result. The first player submits the score, and the second player reviews and confirms it.

![Confirmation flow](./07-scoring-confirm.png)

## The Confirmation Flow

### 1. First Player Submits

Either player can be the first to submit. When you click **Submit Score**, you enter both your VP and your opponent's VP (plus any battle objectives). The system records you as the submitter.

### 2. Submitter Waits

After submitting, you see the **Waiting for Confirmation** view:

![Waiting for confirmation](./07-scoring-confirm-waiting.png)

- An amber banner reads: **"Waiting for opponent to confirm"**
- A score summary box shows the VP and outcome you submitted
- An **Edit Submission** button lets you change the scores before your opponent confirms

This view refreshes automatically. Once your opponent confirms, it transitions to the Match Complete state.

### 3. Opponent Reviews & Confirms

Your opponent sees the **Opponent Submitted Result** view:

![Pending confirmation](./07-scoring-confirm-review.png)

- A blue banner reads: **"Opponent Submitted Result"**
- A score summary box shows the submitted VP and outcome for both players
- A prompt reads: "Please review and confirm if this is correct"
- A green **Confirm Result is Correct** button finalises the match

The opponent reviews the submitted scores and, if they agree, clicks **Confirm Result is Correct**. The match is then marked as complete.

## Editing Before Confirmation

If you submitted the score and spot an error, click **Edit Submission** on the waiting screen. This reopens the score entry form with your previous values pre-filled. Make your corrections and click **Update Score**.

You can only edit while your opponent hasn't confirmed yet. Once they confirm, the match is locked.

## Match Complete

Once both players have submitted and confirmed, a green **Match Complete** banner appears with a checkmark. The match result becomes read-only — VP, outcomes, and battle objectives are all finalised.

The result now counts toward standings, and both players can see the completed match in their **History** tab.

## What If There's a Disagreement?

If the opponent believes the submitted scores are wrong, they should discuss it with the submitter. The submitter can click **Edit Submission** to correct the values. If they can't agree, the Tournament Organiser can override the result from the admin interface.
