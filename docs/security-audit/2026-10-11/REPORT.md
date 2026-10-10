**Security audit and test report — 11 October 2026 (Asia/Jakarta)**

Historical baseline: the findings below describe the pre-fix application. See [REMEDIATION.md](D:/Kerja/ppk-tubes/docs/security-audit/2026-10-11/REMEDIATION.md) for the fixes and current verification results. The old reproduction tests intentionally expect vulnerable behavior; use `tests/Feature/SecurityRemediationTest.php` and `private-upload-check.ps1` for current checks.

Project: Buana, `D:\Kerja\ppk-tubes`, commit `699ac2e`.

**Assessment:** Fix public access to private uploads and the server-side workflow checks before using this application with real campus data. Authentication has substantial working protections, but those protections do not extend to stored attachments. Approval and maintenance actions can also produce invalid states.

This pass reviewed routes, middleware, authentication/session handling, ownership checks, input and upload validation, database writes, exports, frontend rendering, configuration, and dependency locks. It ran the existing PHP/JavaScript suites, isolated security probes, and anonymous requests to a temporary localhost server. Application code and dependency versions were not changed.

| Finding | Severity in this project | Evidence |
| --- | --- | --- |
| F1. Proposal PDFs and report photos bypass authentication | High | Upload probes plus anonymous HTTP 200 responses |
| F2. Approval replay creates conflicting bookings and revives cancelled requests | Medium | Two deterministic request-level reproductions |
| F3. Completing one repair reopens a room with another active repair | Medium | Request-level reproduction |
| F4. Cancellation deadline is enforced only by the UI | Medium | Owner cancelled a reservation after its start |
| F5. Dependency locks contain published vulnerabilities | Medium remediation priority; upstream ratings reach Critical | Composer and npm advisory queries; application exploitability qualified below |

**F1 — Private attachments are publicly served**

Locations: [ReservationController.php:451](D:/Kerja/ppk-tubes/app/Http/Controllers/ReservationController.php:451), [ReportController.php:68](D:/Kerja/ppk-tubes/app/Http/Controllers/ReportController.php:68), [filesystems.php:41](D:/Kerja/ppk-tubes/config/filesystems.php:41).

Proposals are saved with `store('proposals', 'public')`; report evidence uses `store('reports', 'public')`. The configured public disk is linked directly to `public/storage`, and that junction exists in this checkout. Static files bypass Laravel's authentication, role, verification, and ownership middleware. The React report pages also link directly to `/storage/...`.

The upload tests confirmed both file types land on the public disk. A separate probe created harmless markers in each upload directory and requested them without cookies or authorization through Laravel's development-server router. Both returned **200**, with matching content. The temporary server was stopped and marker files removed.

Anyone who obtains an attachment URL can download it, including after logout. Random filenames limit guessing but do not enforce access control; no filename enumeration or bulk disclosure was demonstrated. Severity assumes these proposal documents and report evidence are private, consistent with their account-restricted parent pages.

Remediation: store these attachments on a private disk and serve them through a controller that verifies ownership or an authorized staff role. Migrate existing attachments and remove their publicly accessible copies. Keep public facility catalogue photos public. Add guest/other-user/owner/operator download tests, and use appropriate private cache and content-disposition headers.

**F2 — Approval does not enforce booking state or conflicts**

Location: [OperatorController.php:24](D:/Kerja/ppk-tubes/app/Http/Controllers/OperatorController.php:24).

`approve()` unconditionally marks the supplied reservation approved, then rejects only overlapping requests still marked pending. It never rejects approval when an overlapping approved reservation already exists, when the request was cancelled/rejected, or when the facility is unavailable.

Reproduction: create two pending reservations for the same room/date/time; approve A; B becomes rejected; send `PATCH /operator/reservations/{B}/approve`. **A and B both finish approved.** A second probe approved a cancelled reservation whose room was disabled. Both requests were made as an operator; this is a workflow integrity defect, not an unauthenticated or regular-user role bypass. A stale operator page is enough to trigger the conflict case; concurrency is unnecessary.

Remediation: within a transaction, lock the room and relevant booking state, require a valid source status and available facility, recheck approved overlaps and applicable time limits, and only then approve. Use the same locking discipline for repair/availability changes to avoid concurrent bypasses. Return an explicit conflict/validation response and test replay, cancelled/rejected requests, disabled rooms, and concurrent decisions.

**F3 — One completed report clears another repair's availability restriction**

Location: [OperatorController.php:106](D:/Kerja/ppk-tubes/app/Http/Controllers/OperatorController.php:106), especially line 121.

`markAsCompleted()` always sets the room's `is_avail` flag to true. With two reports in `diproses` for the same room, completing either one reopens the room even though the other remains in progress. The isolated probe confirmed exactly this state. The endpoint also lacks a source-status check, so replaying completion can re-enable availability again. This can expose a facility to new reservations while maintenance is still active, or overwrite a separate administrative deactivation.

Remediation: model administrative deactivation separately from repair restrictions, and derive availability from all remaining restrictions. Validate allowed report transitions and update the report plus facility atomically. Test multiple simultaneous repairs, repeated completion, and an independently disabled facility.

**F4 — Owners can bypass the cancellation deadline**

Locations: [ReservationController.php:136](D:/Kerja/ppk-tubes/app/Http/Controllers/ReservationController.php:136), [Reservation.php:37](D:/Kerja/ppk-tubes/app/Models/Reservation.php:37), [README.md:25](D:/Kerja/ppk-tubes/README.md:25).

The cancellation controller checks ownership and pending status, then changes the status without checking time. The UI uses `canStillBeProcessed()` to hide the action, but a direct authenticated PATCH bypasses that restriction. At a frozen 10:00, the probe successfully cancelled a pending reservation starting at 09:00 that day.

There is also a policy mismatch: the README specifies a six-hour cancellation cutoff, while the model's UI helper uses twelve hours. Remediation: define a dedicated cancellation policy with the intended cutoff, use it in both controller and UI, and atomically validate the current booking status. Test exact cutoff boundaries, after-start requests, and concurrent operator decisions.

**F5 — Vulnerable dependency versions are locked**

Locations: [composer.lock:2030](D:/Kerja/ppk-tubes/composer.lock:2030), [package-lock.json:4849](D:/Kerja/ppk-tubes/package-lock.json:4849), [package-lock.json:5199](D:/Kerja/ppk-tubes/package-lock.json:5199).

`composer audit --locked` reported two advisories against `league/commonmark` **2.10.0**: a raw-HTML filtering bypass and a GFM table-parser denial of service. Both have fixes in **2.10.2**. These require relevant processing of untrusted Markdown; no such application input path was identified in the reviewed controllers/views. Treat this as confirmed vulnerable dependency presence, not a demonstrated stored-XSS/DoS exploit against Buana. Sources: [maintainer HTML advisory](https://github.com/thephpleague/commonmark/security/advisories/GHSA-97jj-33gv-5xf9), [maintainer parser advisory](https://github.com/thephpleague/commonmark/security/advisories/GHSA-3q6v-r5mr-hxv8).

`npm audit` reported **13 affected package entries: 5 Critical, 6 High, 2 Moderate**. These counts include dependent packages and are not 13 separate exploitable application bugs. Notable roots:

| Locked package | Advisory / fix | Project context |
| --- | --- | --- |
| `shell-quote` 1.9.0 | Command injection; fixed in 1.11.0 | Through `concurrently`; exploitation needs attacker-controlled tokens in a shell construction path. [Maintainer advisory](https://github.com/ljharb/shell-quote/security/advisories/GHSA-pqg4-j6r4-53mv) |
| `tinypool` 2.1.0 | Prototype-pollution gadgets leading to code execution; update to at least 2.1.2 | Through `oxfmt` / `vite-plus`; requires additional prototype pollution and relevant worker options. [Maintainer advisory](https://github.com/tinylibs/tinypool/security/advisories/GHSA-85c8-ppgw-ccpr) |
| `braces` 3.0.3 | Stack-exhaustion DoS | Tailwind/glob/watch tooling; see the saved npm report |
| `postcss-selector-parser` | Selector-parser CPU exhaustion | CSS build tooling; see the saved npm report |
| `source-map-js` | Source-map processing DoS | Source-map tooling; see the saved npm report |

The principal affected JavaScript paths are development/build tooling; no public HTTP-to-shell or worker exploit chain was established. Update compatible direct/transitive versions and rerun audits and build tests. The scanner suggests newer `concurrently` and `vite-plus` releases, but some Tailwind suggestions require a major migration, so do not apply `npm audit fix --force` indiscriminately. Dependabot currently covers only GitHub Actions; add Composer/npm coverage and a CI audit gate.

**Test results and additional issues**

| Check | Result |
| --- | --- |
| Existing PHPUnit suite | **271 tests: 242 passed, 16 failures, 13 errors; 3,093 assertions** |
| Existing JavaScript suite | **62/62 passed** |
| New isolated audit probes | **8/8 passed; 28 assertions** — these confirm current defects/control behavior, not that the defects are fixed |
| Anonymous attachment HTTP probes | Both directories returned 200 with matching synthetic contents |
| Composer audit | Two advisories affecting one locked package |
| npm audit | 13 affected package entries, including dependent packages |
| Tracked-file private-key/common-token pattern scan | No matching patterns; heuristic scan only, not a full history/secret audit |

The existing role authorization (16), session security (16), verification/provisioning (9), and private-history (4) tests all passed. These exercise cross-role denial, ticket ownership, login throttling, session rotation/revocation, CSRF, verification gates, and guarded demo seeding. Admin account validation and facility-image tests also passed. Reviewed SQL filters use bound parameters/allowlisted sort choices, CSV export escapes formula-leading values, and PDF export disables remote fetching. No demonstrated SQL injection, cross-role privilege escalation, or reachable stored XSS was found in this pass.

The PHP suite is **not green**. A confirmed functional defect is [ReservationController.php:212](D:/Kerja/ppk-tubes/app/Http/Controllers/ReservationController.php:212): `facilities()` calls `facilityBrowserData()` with one argument even though it requires two, so `GET /reservations/facilities` returns **500** for an authenticated user. Other failures include outdated registration route expectations, fixtures missing required `activity_name`, and old three-hour reservation-cutoff expectations. These prevent parts of the intended validation/privacy coverage from reaching their assertions. Details are in `phpunit-failure-summary.json`.

Additional abuse-control gap: reservation/report creation has no application route throttle or per-user storage/record quota. Per-file size limits exist, but repeated accepted requests can accumulate files and rows, and `ReportController::index()` retrieves a user's entire report history. The route probe verified the missing throttle; no stress test or actual resource exhaustion was attempted. Add reasonable creation/upload limits, retention rules, bounded description/image counts, and report pagination.

This checkout uses local/debug settings and log mail delivery. Those settings are appropriate to local development and are not evidence of an exposed production deployment. Before deployment, verify production mode, debug off, functioning mail delivery, HTTPS/secure cookies, the web root restricted to `public`, and removal of any previously seeded demo accounts. The demo seeder already refuses non-local/non-testing environments.

**Reproduction and scope limits**

From `D:\Kerja\ppk-tubes`:

```powershell
php vendor/phpunit/phpunit/phpunit --configuration phpunit.xml docs/security-audit/2026-10-11/SecurityAuditReproductionTest.php --do-not-cache-result
& ./docs/security-audit/2026-10-11/public-upload-probe.ps1
node --test tests/JavaScript/*.test.js
composer audit --locked --format=json --no-interaction
npm.cmd audit --json --ignore-scripts
```

PHP request probes use the root PHPUnit configuration's in-memory SQLite database and fake upload disk. The HTTP probe uses only temporary synthetic markers and the existing local storage junction. It does not read user attachments. Initial sandbox PHP-read and registry-DNS limitations were resolved by rerunning the relevant commands with approved access. The audit PNG fixture avoids this PHP runtime's missing GD extension.

This was a local source/test audit, not a penetration test against deployed infrastructure. Production reverse-proxy rules, TLS/cookies, mail delivery, MySQL-specific behavior, browser exploit chains, load resistance, and concurrent transaction behavior were not validated. The sequential workflow reproductions do not depend on a concurrency exploit. No production database operations, dependency upgrades, or application fixes were performed.

Saved evidence: `SecurityAuditReproductionTest.php`, `reproductions.xml`, `public-upload-probe.ps1`, `http-probe-results.json`, `composer-audit.json`, `npm-audit.json`, and `phpunit-failure-summary.json` in this directory. Full baseline PHPUnit diagnostics are also available in `storage/logs/security-audit-phpunit.xml`.
