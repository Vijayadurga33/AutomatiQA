### Summary of Changes & Enhancements

1. **Environment Configuration (`.env`)**: Updated `BASE_URL` to point to `https://www.instagram.com` as requested.
2. **Page Object Model (`pages/LoginPage.ts`)**: Created the `LoginPage` class extending `BasePage` to encapsulate Instagram login elements (`usernameInput`, `passwordInput`, `loginButton`) and actions (`login`).
3. **Authentication Setup (`tests/auth.setup.ts`)**: Created an authentication setup file to handle logging into Instagram using the provided credentials (`vijaya` / `vijju789`) and persisting the browser storage state to `playwright/.auth/user.json`.
4. **Login Test Specification (`tests/login.spec.ts`)**: Created automated test cases verifying the login workflow for Instagram using Playwright test runners.

---

### Impacted Files
- `.env`
- `pages/LoginPage.ts`
- `tests/auth.setup.ts`
- `tests/login.spec.ts`
- `playwright.config.ts`

---

### 1. `.env`
```env
BASE_URL=https://www.instagram.com
```

---

### 2. `pages/LoginPage.ts`
```typescript
import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { EnvUtils } from '../utils/envUtils';

export class LoginPage extends BasePage {
  public usernameInput: Locator;
  public passwordInput: Locator;
  public loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: /log in/i });
  }

  public async login(username: string, pass: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, pass);
    await this.clickElement(this.loginButton);
  }
}
```

---

### 3. `tests/auth.setup.ts`
```typescript
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { EnvUtils } from '../utils/envUtils';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('Instagram Authentication Setup', async ({ page }) => {
  await page.goto(EnvUtils.BASE_URL);
  const loginPage = new LoginPage(page);
  await loginPage.login('vijaya', 'vijju789');
  await page.waitForTimeout(3000);
  await page.context().storageState({ path: authFile });
});
```

---

### 4. `tests/login.spec.ts`
```typescript
import { test, expect, Page } from '@playwright/test';
import { EnvUtils } from '../utils/envUtils';
import { LoginPage } from '../pages/LoginPage';

test.describe('Instagram Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await page.goto(EnvUtils.BASE_URL);
    loginPage = new LoginPage(page);
  });

  test('Should render Instagram login inputs correctly', async ({ page }, testInfo) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('Should enter credentials and submit Instagram login', async ({ page }, testInfo) => {
    await loginPage.login('vijaya', 'vijju789');
    await expect(loginPage.loginButton).toBeEnabled();
  });
});
```

---

### 5. `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';
import EnvUtils from './utils/envUtils';
import path from 'path';

const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');
const runId = new Date().getTime();

export default defineConfig({
  timeout: 180000,
  expect: {
    timeout: 60000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: `test-results/run-${runId}`,
  reporter: [
    ['html', { outputFolder: `playwright-report/run-${runId}` }]
  ],
  use: {
    baseURL: EnvUtils.BASE_URL,
    actionTimeout: 50000,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.(ts|js)/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ],
});
```