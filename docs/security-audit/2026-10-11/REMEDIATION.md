**Security remediation — 11 October 2026**

All five findings in the audit have code fixes and regression coverage. The facility-browser error, stale test fixtures, and additional resource-abuse gaps are also addressed.

| Finding | Fix |
| --- | --- |
| F1: public attachments | Uploads and seeded evidence use `storage/app/private/attachments`. Authenticated, verified owners and admin/operator staff can download through protected routes. Other users receive 403; missing/unsafe paths return 404. Downloads use attachment disposition, private/no-store caching, and nosniff. Existing files are copied, SHA-256 verified, then removed from the public disk. Public catalogue photos remain public. |
| F2: approval replay/conflicts | Approval requires a pending request, future start, an enabled room, no active repair, and no overlapping approved booking. Transactions lock the room before the booking. Creation, cancellation, repairs, and admin availability updates use compatible room-lock ordering. Invalid/stale actions return validation errors without reviving rejected or cancelled requests. |
| F3: repair availability | Administrative deactivation is stored separately. Completing a processing report reopens a room only when no other repair or admin deactivation remains. Report transitions and estimate extensions are checked. Overdue repair extension rejects overlapping upcoming/ongoing bookings while preserving past bookings. Admin controls can deactivate rooms during a repair. |
| F4: cancellation cutoff | The server and UI share a dedicated six-hour cancellation rule for pending reservations, matching the README. Exactly six hours before start is allowed; later cancellation is refused. |
| F5: dependencies | CommonMark upgraded to 2.10.3. JavaScript tooling/transitive dependencies updated, including Tailwind 4.3.3, its PostCSS integration, and Vite Plus 0.3.3. Both dependency audits report zero known advisories. Weekly Dependabot and CI audits, static analysis, tests, and build checks are configured. |

Creation is limited per account across reservation/report endpoints to 10 requests/minute and 60/hour, 500 reservations, 500 reports, and 100 MiB of attachment data. These values are configured in `config/attachments.php`. Failed submissions remove newly stored files. Description lengths, image counts/dimensions, and participant capacity are bounded. Report history uses server filtering and pagination. A daily task removes private files older than 30 days only when no database record references them; referenced historical evidence is retained. `attachments:prune --dry-run` previews cleanup.

Verification:

These results were captured after the security fixes. The subsequent React cleanup passes **290 PHP tests (3,714 assertions), 49 JavaScript tests, PHPStan, and the production build**. It converts the verification, password-confirmation, and legacy facility-list endpoints to React, removes project Blade templates and Alpine, and retains plain PHP only for the Inertia document shell and PDF rendering. Tests for obsolete Blade scripts were replaced with checks of the React slot-loading hook. The saved security evidence below remains the original remediation snapshot.

- PHP: 287 tests, 3,577 assertions, zero failures/errors; includes 16 new remediation regressions.
- JavaScript: 62 tests passed.
- PHPStan: zero errors; changed PHP files pass Pint.
- Production frontend build passed; clean npm installation verified.
- Composer and npm audits: zero known advisories.
- Anonymous localhost checks: proposal/report/report-image paths, encoded names, and dot paths return 404. The synthetic public facility photo returns 200. No actual user attachments were requested.

The local workspace SQLite database was backed up consistently under the ignored private `storage/app/private/security-backups` directory. Both additive migrations were applied and one existing attachment was verified and moved out of public storage. Older installations lacked reservation columns because an earlier creation migration had been edited; the compatibility migration adds missing columns while preserving bookings. Historical bookings receive the activity label “Kegiatan sebelumnya”. No production deployment or database was accessed.

For another installation, back up its database and attachment storage, deploy the code with the web root restricted to `public`, and run these commands during a maintenance window:

```sh
composer install --no-interaction --prefer-dist
npm ci --ignore-scripts
npm run build
php artisan migrate --force
php artisan attachments:privatize
php artisan config:cache
```

Run the normal Laravel scheduler so overdue repairs and orphan retention execute. Preserve the private attachments directory in backups and future deployments. Never link it into the public web root. The copy/verification command is repeatable; if it detects a conflicting private copy, it stops and preserves the public original so the conflict can be resolved during maintenance.

The development router and Apache configuration deny legacy private directories. For nginx, put the following location before general static-file rules, reload nginx, and verify private paths are denied:

```nginx
location ~* ^/storage/(proposals|reports|report-images)(/|$) {
    return 404;
}
```

Existing inactive rooms without an active repair are backfilled as administratively disabled. Older data cannot reveal whether a room with an active repair was also manually disabled; review those rooms and explicitly deactivate them if that restriction should persist after repair.

The Tailwind major upgrade removes vulnerable Tailwind 3 tooling; its PostCSS/config integration and default border compatibility were updated. The production build passes, but a full visual/browser regression pass has not been performed. Tailwind 4 targets modern browsers; consult its [upgrade guide](https://tailwindcss.com/docs/upgrade-guide). Vite Plus's alias and npm override follow its [local CLI integration guidance](https://www.viteplus.dev/guide/local-cli).

Evidence is saved as `remediation-*.json` and `remediation-junit.xml` in this directory. Verbose local diagnostics are in the ignored `storage/logs/remediation-*` files. These local checks do not validate deployed nginx/Apache configuration, MySQL-specific concurrent transaction behavior, infrastructure security, or load resistance. Real concurrent decisions were not stress-tested; SQLite request tests verify deterministic state/conflict rejection.
