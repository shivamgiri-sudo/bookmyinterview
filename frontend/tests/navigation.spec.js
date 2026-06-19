import { test, expect } from '@playwright/test';

const session = {
  user: { id: 1, email: 'qa@example.test', full_name: 'QA User', role: 'superadmin', tenant_id: 1 },
  access_token: 'test-token',
  token_type: 'bearer',
};

const pages = [
  ['/', 'Screen, assess, and book interview-ready talent'],
  ['/login', 'Login with role-based access'],
  ['/account', 'Account lifecycle contracts are ready'],
  ['/monitor', 'Monitor now has presets, alerts, filters, and event detail'],
  ['/secure', 'Tenant-scoped workspace is now permission checked'],
  ['/workspace', 'Create and read tenant-scoped records'],
  ['/client', 'Client command center now reads tenant-scoped workspace data'],
  ['/intake', 'Create a secure tenant-scoped job and generate the hiring path'],
  ['/engine', 'Generated evaluation paths are now visible from scoped records'],
  ['/talent', 'Create tenant-scoped talent records with consent-first workflow'],
  ['/insights', 'Turn assessment data into role-specific business insight'],
  ['/templates', 'Every communication should look enterprise-grade'],
  ['/master', 'Master data console for platform setup'],
  ['/report', 'Client-ready report preview builder'],
  ['/flow', 'Assessment flow prepared'],
  ['/status', 'Platform status board ready'],
  ['/hub', 'Hub now reads scoped workspace summary'],
  ['/vault', 'Provider cost and configuration controls are visible'],
  ['/controls', 'Regional controls now read from backend'],
  ['/plans', 'Plan setup now connects to backend configuration'],
  ['/cost', 'Control provider costs'],
];

for (const [path, heading] of pages) {
  test(`renders ${path}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('bmi_session', JSON.stringify(value)), session);
    await page.goto(path);
    await expect(page.getByText(heading)).toBeVisible();
  });
}
