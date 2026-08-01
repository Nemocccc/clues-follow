import { test, expect, type Page } from "@playwright/test";

async function addLead(page: Page, opts: {
  name: string;
  contact?: string;
  source?: string;
  status?: string;
}) {
  await page.getByTestId("inp-name").fill(opts.name);
  if (opts.contact) await page.getByTestId("inp-contact").fill(opts.contact);
  if (opts.source) await page.getByTestId("inp-source").fill(opts.source);
  if (opts.status) await page.getByTestId("inp-status").selectOption(opts.status);
  await page.getByTestId("btn-add").click();
}

function column(page: Page, status: string) {
  return page.locator(`[data-testid="column"][data-status="${status}"]`);
}

/** 带自动等待的断言：卡片出现在某列（React 渲染是异步的，count() 即时查询会误报） */
async function expectCardInColumn(page: Page, status: string, name: string) {
  await expect(column(page, status).locator('[data-testid="lead-card"]', { hasText: name })).toHaveCount(1);
}

async function expectCardNotInColumn(page: Page, status: string, name: string) {
  await expect(column(page, status).locator('[data-testid="lead-card"]', { hasText: name })).toHaveCount(0);
}

test.describe("线索跟进记录 E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("T1 添加线索 → 出现在待联系列且计数正确", async ({ page }) => {
    await addLead(page, { name: "小美", contact: "wx:xiaomei", source: "抖音" });
    await expectCardInColumn(page, "pending", "小美");
    await expect(column(page, "pending").getByTestId("column-count")).toHaveText("1");
    const meta = await column(page, "pending").getByTestId("lead-meta").innerText();
    expect(meta).toContain("wx:xiaomei");
    expect(meta).toContain("抖音");
  });

  test("T2 添加跟进记录 → 显示在卡片内且带时间戳", async ({ page }) => {
    await addLead(page, { name: "小美" });
    const card = page.locator('[data-testid="lead-card"]', { hasText: "小美" });
    await card.getByTestId("note-input").fill("3月1日：加上微信了");
    await card.getByTestId("note-add").click();
    await expect(card.getByTestId("note")).toHaveCount(1);
    await expect(card.getByTestId("note")).toContainText("加上微信了");
    await expect(card.getByTestId("note").locator("span").first()).not.toBeEmpty();
  });

  test("T3 刷新后线索与跟进记录都在", async ({ page }) => {
    await addLead(page, { name: "阿强", contact: "13800000000", source: "朋友介绍" });
    const card = page.locator('[data-testid="lead-card"]', { hasText: "阿强" });
    await card.getByTestId("note-input").fill("已发邀约");
    await card.getByTestId("note-add").click();
    await page.reload();
    await expectCardInColumn(page, "pending", "阿强");
    const cardAfter = page.locator('[data-testid="lead-card"]', { hasText: "阿强" });
    await expect(cardAfter.getByTestId("note")).toContainText("已发邀约");
  });

  test("T4 状态切换 → 自动移列，刷新后保持", async ({ page }) => {
    await addLead(page, { name: "小美" });
    const card = page.locator('[data-testid="lead-card"]', { hasText: "小美" });
    await card.getByTestId("lead-status").selectOption("contacted");
    await expectCardInColumn(page, "contacted", "小美");
    await expectCardNotInColumn(page, "pending", "小美");
    await page.reload();
    await expectCardInColumn(page, "contacted", "小美");
  });

  test("T5 三种状态各归其列", async ({ page }) => {
    await addLead(page, { name: "甲", status: "pending" });
    await addLead(page, { name: "乙", status: "contacted" });
    await addLead(page, { name: "丙", status: "booked" });
    await expectCardInColumn(page, "pending", "甲");
    await expectCardInColumn(page, "contacted", "乙");
    await expectCardInColumn(page, "booked", "丙");
    for (const st of ["pending", "contacted", "booked"]) {
      await expect(column(page, st).getByTestId("column-count")).toHaveText("1");
    }
  });

  test("T6 空名字不提交", async ({ page }) => {
    await page.getByTestId("btn-add").click();
    await expect(page.locator('[data-testid="lead-card"]')).toHaveCount(0);
  });

  test("T7 XSS 注入按纯文本渲染", async ({ page }) => {
    await addLead(page, { name: '<img src=x onerror=alert(1)>', contact: '<script>alert(2)</script>' });
    await expect(page.locator('[data-testid="lead-card"] img')).toHaveCount(0);
    await expect(page.getByTestId("lead-name").first()).toContainText("onerror=alert(1)");
  });

  test("T8 编辑线索", async ({ page }) => {
    await addLead(page, { name: "小美", contact: "wx:xiaomei" });
    const card = page.locator('[data-testid="lead-card"]', { hasText: "小美" });
    await card.getByTestId("btn-edit").click();
    await page.getByTestId("edit-name").fill("小美（改）");
    await page.getByTestId("edit-contact").fill("新微信");
    await page.getByTestId("edit-status").selectOption("booked");
    await page.getByTestId("edit-save").click();
    await expectCardInColumn(page, "booked", "小美（改）");
    const cardAfter = page.locator('[data-testid="lead-card"]', { hasText: "小美（改）" });
    await expect(cardAfter.getByTestId("lead-meta")).toContainText("新微信");
  });

  test("T9 删除线索（二次确认）", async ({ page }) => {
    await addLead(page, { name: "小美" });
    const card = page.locator('[data-testid="lead-card"]', { hasText: "小美" });
    await card.getByTestId("btn-delete").click();
    await expect(card.getByTestId("btn-delete")).toHaveText("确认删除？");
    await card.getByTestId("btn-delete").click();
    await expect(page.locator('[data-testid="lead-card"]')).toHaveCount(0);
  });

  test("T10 搜索过滤", async ({ page }) => {
    await addLead(page, { name: "小美", contact: "wx:xiaomei" });
    await addLead(page, { name: "阿强", contact: "13800000000" });
    await page.getByTestId("inp-search").fill("阿强");
    await expectCardInColumn(page, "pending", "阿强");
    await expectCardNotInColumn(page, "pending", "小美");
  });

  test("T11 未跟进标红提醒", async ({ page }) => {
    await page.evaluate(() => {
      const now = Date.now();
      const staleLead = {
        id: "stale-1",
        name: "旧线索",
        contact: "",
        source: "",
        status: "pending",
        createdAt: now - 5 * 86400_000,
        updatedAt: now - 5 * 86400_000,
        notes: [],
      };
      const freshLead = {
        id: "fresh-1",
        name: "新线索",
        contact: "",
        source: "",
        status: "pending",
        createdAt: now,
        updatedAt: now,
        notes: [],
      };
      localStorage.setItem("lead-tracker-v1", JSON.stringify({ state: { leads: [staleLead, freshLead] }, version: 1 }));
    });
    await page.reload();
    const staleCard = page.locator('[data-testid="lead-card"]', { hasText: "旧线索" });
    await expect(staleCard.getByTestId("stale-badge")).toHaveText(/5 天未跟进/);
    const freshCard = page.locator('[data-testid="lead-card"]', { hasText: "新线索" });
    await expect(freshCard.getByTestId("stale-badge")).toHaveCount(0);
  });

  test("T12 导入导出 JSON 往返", async ({ page }) => {
    await addLead(page, { name: "小美", contact: "wx:xiaomei", source: "抖音" });
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("btn-export").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("lead-tracker-backup");

    // 清空后导入
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="lead-card"]')).toHaveCount(0);
    await page.getByTestId("inp-file").setInputFiles(await download.path());
    await expect(page.locator('[data-testid="lead-card"]', { hasText: "小美" })).toHaveCount(1);
  });
});
