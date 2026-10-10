# Single-use contract invitations

The application expects the `public.contract_invitations` table created in Neon with:
`session_id`, UUID `id`, `created_at`, `expires_at`, `status`,
`processing_started_at`, and `signed_at`.
No additional columns are needed for this implementation.

## Issuing and signing

- The authenticated contract-link API creates an invitation with the database's default 30-day expiry. The signed token includes its UUID, booking ID, phone, consent selection, language, contract version and expiry.
- Creating a replacement revokes older pending invitations for that booking. Issuance is serialized by locking the booking row.
- Links created before this change have no invitation ID and must be replaced through the existing Send Contract page.
- Price lookup checks the invitation record as well as the token. Used, processing, revoked and expired invitations cannot load the form.
- PDF generation happens before claiming an invitation, so a PDF-generation failure leaves it available for retry.
- Immediately before sending email, a conditional database update changes `pending` to `processing`. Concurrent or repeated requests cannot both win this update.
- After the email provider accepts the message, one database transaction updates client details, marks the booking signed and changes the invitation to `signed` with a timestamp.
- Reopening a signed link displays an already-signed message. Administrators can issue a new invitation for a correction.

## Interrupted submissions

Email sending and a PostgreSQL transaction cannot be committed atomically together.
Once a claim succeeds, errors or a terminated function leave the invitation in
`processing`. It is intentionally never unlocked by elapsed time alone: the
provider may have accepted the email even if the application lost its response.
The client is asked to contact the photographer, and issuing another invitation
for the booking is blocked until this state is reviewed.

To investigate, use Neon SQL Editor:

```sql
SELECT id, session_id, status, processing_started_at, expires_at
FROM public.contract_invitations
WHERE status = 'processing'
ORDER BY processing_started_at;
```

Before changing a processing record, confirm that the original Vercel function
has ended and check Vercel logs and the email provider's delivery record.
If delivery succeeded, reconcile the client details and booking from the signed
PDF, and mark the invitation signed with its signing timestamp. If the contract
was not delivered and the outcome is certain, revoke the invitation, then issue
a fresh link. If the outcome is unknown, leave it locked for further review.
Do not automatically reset processing invitations to pending.

## Verification

Run `node --test tests/security.test.mjs`, `npm run check:astro`,
`npm run check:eslint`, and `npm run build`.
The regression tests mock database and email operations; they never send real
contracts or write to Neon. A successful production build does not verify that
the table was created in the same Neon branch/database used by Vercel.

## Russian contracts

On Send Contract, choose Hebrew (default) or Russian under שפת החוזה. The signed
invitation controls the language of the form, duration, PDF variant, email and
confirmation. Changing URL/form parameters cannot override it. Existing invitations
without locale/version remain Hebrew; unsupported claims are rejected.

Russian templates and filled fields use the site's Rubik font. Both publication
variants preserve the approved terms. Signing records `contract_language` and
`contract_version` in the session workflow and in the PDF metadata. No schema
migration is needed. Contract and confirmation pages in both languages are noindex,
excluded from the sitemap, suppress analytics and use a no-referrer policy.

Validation includes real PDF filling/flattening with mocked email/database calls,
legacy/tampered token coverage, localized lookup/issuance, mobile/desktop rendering,
both consent variants, signature validation, all invitation states, PDF failure and
language redirects. No live email or production database operations were performed.
