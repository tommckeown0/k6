import { browser } from "k6/experimental/browser";
import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  scenarios: {
    // ui: {
    //   executor: "shared-iterations",
    //   exec: "browserFunction",
    //   options: {
    //     browser: {
    //       type: "chromium",
    //     },
    //   },
    // },
    http: {
      executor: "constant-vus",
      exec: "httpFunction",
      vus: 10,
      duration: "5s",
    },
  },
  thresholds: {
    checks: ["rate==1.0"],
  },
};

export async function browserFunction() {
  const context = browser.newContext();
  const page = context.newPage();

  try {
    await page.goto("https://test.k6.io/my_messages.php");

    page.locator('input[name="login"]').type("admin");
    page.locator('input[name="password"]').type("123");

    const submitButton = page.locator('input[type="submit"]');

    await Promise.all([page.waitForNavigation(), submitButton.click()]);

    check(page, {
      header: (p) => p.locator("h2").textContent() == "Welcome, admin!",
    });
  } finally {
    page.close();
  }
}

export async function httpFunction() {
  const res = http.get("https://httpbin.test.k6.io/");
  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
}
