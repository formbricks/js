import { expect, test } from "@playwright/test";

// The golden journey shared by every Formbricks SDK. e2e/server/seed.sh created the survey: NPS
// (qa_nps) then open text (qa_feedback), triggered by `qa-action` and targeted to plan = pro.
// e2e/server/assert-response.sh then checks the stored response through the V1 API, so it needs the
// same E2E_USER_ID and E2E_FEEDBACK.
const userId = process.env.E2E_USER_ID ?? `qa-user-local-${Date.now()}`;
const feedback = process.env.E2E_FEEDBACK ?? "Golden journey feedback";

test("golden journey: identify, target, trigger, answer, close", async ({
  page,
}) => {
  page.on("console", (message) => {
    if (message.text().includes("Formbricks")) {
      console.log(`[browser ${message.type()}] ${message.text()}`);
    }
  });

  // 1. Set up the SDK (the playground calls setup() on load).
  await page.goto("/");
  await expect(
    page.getByText("formbricks_setup_successful").first(),
  ).toBeVisible();

  // 2. setUserId, then setAttribute(plan = pro).
  if (!process.env.E2E_EXPERIMENT_ANON) {
  await page.getByLabel("User ID", { exact: true }).fill(userId);
  await page.getByRole("button", { name: "Set user ID" }).click();
  await page.getByLabel("Attribute key", { exact: true }).fill("plan");
  await page.getByLabel("Attribute value", { exact: true }).fill("pro");
  await page.getByRole("button", { name: "Set attribute" }).click();
  }

  // 3. track('qa-action').
  await page.getByLabel("Action", { exact: true }).fill("qa-action");
  await page.getByRole("button", { name: "Track action" }).click();

  // 4. The survey targeted to plan = pro appears.
  const survey = page.locator("#formbricks-modal-container #fbjs");
  const npsCard = survey.locator("#questionCard-0");
  await expect(npsCard).toContainText("How likely are you to recommend us?");

  // 5. Answer NPS 9 and the open text, finish, then close the ending card.
  await npsCard.locator('label:has(> input[name="qa_nps"][value="9"])').click();
  await npsCard.locator('[data-fb-part="button-primary"]').click();

  const textCard = survey.locator("#questionCard-1");
  await textCard.locator("#qa_feedback-input").fill(feedback);
  await textCard.locator('[data-fb-part="button-primary"]').click();

  await expect(survey.getByText("Thanks!")).toBeVisible();
  await expect(
    page.getByText("formbricks_response_submitted").first(),
  ).toBeVisible();
  await survey.locator('[data-fb-part="button-close"]').click();
  await expect(survey).toHaveCount(0);
  await expect(
    page.getByText("formbricks_survey_closed").first(),
  ).toBeVisible();
});
