# Client profiles and session workflow

## Activate the feature

1. Open the Neon project used by this website. Select the same branch and database as the website's `DATABASE_URL` (and the development database too, if different).
2. Open SQL Editor. Paste and run the complete contents of `migrations/20261003-client-workflow.sql`.
3. Verify the columns and table:

   ```sql
   SELECT notes FROM clients LIMIT 1;
   SELECT workflow FROM sessions LIMIT 1;
   SELECT * FROM session_payments LIMIT 1;
   ```

4. Deploy the code through your normal deployment process after the migration succeeds. No new environment variables or services are required.
5. Sign in and open `/clients`. Search by name, phone (including formatted or +972 numbers), or email. Open a client and create a session from the profile.

The migration adds client notes, session workflow details, and a payment ledger. It does not modify existing prices, balances, contracts, or client information. It is safe to rerun. The existing `sessions` and `clients` tables and contract invitation setup are prerequisites.

## Guided daily workflow

On iPhone, WhatsApp and Google Calendar use direct installed-app links, leaving the client page open underneath. Returning to the browser should show the same page and its continuation button, without using Back. No extra browser tab or automatic web fallback is created. If Safari's tap authorization expires during a save, an inline “Open in app” link waits for a fresh tap. A separate, explicit web fallback is available if the installed app cannot be opened. Desktop behavior remains same-tab web navigation. Pixieset and MyAirBridge upload links still open separately.

Google Calendar dates are converted from the session's Israel wall-clock time to UTC before handing them to the native app, including summer/winter offsets. Existing UTC dates from the older calendar form remain unchanged. Opening the app is not evidence that an event was saved or a message was sent.

Native app launching cannot be end-to-end verified with desktop tests. Check once on the iPhone: open a prepared WhatsApp message and return to the browser; open a Calendar event and verify its title, date, time, location and guests before saving, then return. Google Calendar's native create-event URL is not a versioned public API; app versions may treat fields differently. The web fallback is explicit, never automatic.

App-link references: [WhatsApp URL schemes](https://faq.whatsapp.com/425247423114725/), [Apple custom URL scheme behavior](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app), and the [observed Google Calendar scheme parameters](https://github.com/jimmy-zhening-luo/scheme#google-calendar) (community-maintained, not a Google API contract).

The profile shows one current stage and its main action. Progress, receipts, session details and corrections stay collapsed below it. The design reuses the management pages' header, gray hero, white rounded cards, existing buttons and footer.

- Create a client and session as before. Prepare the contract from the current-stage button. Successful link creation automatically advances the profile to waiting for a signature; it does not claim that WhatsApp sent the message. The contract screen shows a button to continue to signature tracking.
- While waiting for a signature, the profile checks every 20 seconds while visible and when the window regains focus. After signing it reloads into the payment stage. Editing a form pauses automatic reloads to protect unsaved changes; the refresh link remains available.
- Click “Received ₪100 — create receipt” only after receiving the booking payment. It updates the balance once and opens the prefilled receipt screen immediately. Successful receipt creation shows a button to continue to the calendar stage. It never issues a receipt without the existing form submission.
- Enter the date, time, duration and location in the calendar stage. Saving opens a prepared Google Calendar event. After saving in Google, click “Saved in calendar — continue to shoot day.” This confirmation is necessary because opening the calendar does not verify an event was saved.
- After the shoot, one button advances to the remaining payment. Recording it opens its receipt. Receipt completion links back to editing.
- Click “Finished editing — continue to delivery” when the photos are ready. Uploads, gallery links and delivery are grouped into one stage; there are no separate editing-started or upload checkboxes.
- Open Pixieset and MyAirBridge from the delivery stage, upload the images, then paste both links. Preparing the message saves only the Pixieset link. The MyAirBridge field has no form name and is used only in the browser to prepare WhatsApp; it is not sent to the website API or stored. The reminder refers to three days from upload, so adjust it in WhatsApp if sending an older upload.
- After actually sending the links, click “Sent the links — continue to review.” Open the prepared Google review message, then confirm it was sent to finish the session.
- The website cannot verify manual WhatsApp sends, Google Calendar saves or work performed in editing/upload software. These actions have one confirmation-and-continue button directly in the current stage. Completed actions with reliable server evidence (contract preparation/signature, payment recording and receipt issuance) advance automatically.
- Older session details and the correction controls remain available. Existing checklist values are preserved. This UI update needs **no additional database migration**.

## Existing sessions

Existing `to_pay` and `contract_signed` values remain authoritative. Historical receipts and payments are **not** inferred from the remaining balance. Do not record old payments again if they were already deducted by the old receipt screen. Old sessions can therefore have incomplete payment/receipt checklists until their history is reconciled. New sessions support the complete workflow from the beginning.

The old receipt URL without a payment selection now opens client search. Select the intended session and its recorded payment before issuing a receipt. This prevents receipts being attached to the latest session by phone number. Existing contract and calendar utility pages remain available, while profile links select the intended booking.

## Receipt recovery (only if a receipt is stuck)

The app claims a payment before asking Morning to create its receipt. A second click or retry cannot create another receipt for that payment. If Morning or the network fails after the request starts, the payment remains `processing` because a receipt may already exist.

1. Wait for the original server request to finish. Check the client and payment in Morning and the server logs.
2. Inspect the affected record:

   ```sql
   SELECT p.*, c.name, c.phone
   FROM session_payments p
   JOIN sessions s ON s.id = p.session_id
   JOIN clients c ON c.id = s.client_id
   WHERE p.receipt_status = 'processing'
   ORDER BY p.created_at;
   ```

3. If a receipt exists, copy its actual ID, number and HTTPS URL from Morning, and reconcile that exact payment (replace all placeholders):

   ```sql
   UPDATE session_payments
   SET receipt_status = 'issued',
       receipt_id = 'ACTUAL_MORNING_DOCUMENT_ID',
       receipt_number = 'ACTUAL_RECEIPT_NUMBER',
       receipt_url = 'https://ACTUAL_RECEIPT_URL'
   WHERE id = 'ACTUAL_PAYMENT_UUID'::uuid
     AND receipt_status = 'processing';
   ```

4. Only when Morning confirms that **no receipt was created**, reset that payment to allow another attempt:

   ```sql
   UPDATE session_payments SET receipt_status = 'pending'
   WHERE id = 'ACTUAL_PAYMENT_UUID'::uuid AND receipt_status = 'processing';
   ```

Do not reset an unknown outcome. Never deduct the payment again during receipt recovery. A wrongly recorded payment or an issued receipt requiring correction should be reviewed against Morning before changing the payment ledger or balance; this first version has no refund/cancellation workflow.

## Verification

- `node --test tests/*.test.mjs`: existing contract/authentication tests and new workflow/receipt regression tests. These mock database and provider calls and send no real documents or messages.
- `npm run check:astro`
- `npm run check:eslint`
- `npm run build`

After migration, verify client search and profile loading against your Neon branch. Real receipt delivery and calendar/WhatsApp actions require your manual end-to-end check; automated checks deliberately do not issue real receipts or contact clients.

### Manual payment and receipt completion

Both deposit and balance stages offer “קיבלתי תשלום והקבלה טופלה — המשך”. This records the payment on the selected date, deducts it from the remaining balance once, and marks its receipt as handled without calling Morning. The normal receipt-generation option remains available. An already-recorded payment with a pending receipt also offers “הקבלה טופלה — המשך”; this does not deduct the amount again. Processing receipts cannot be manually overwritten.

Manually handled receipts use the existing `issued` status with no generated receipt URL; payment history labels them as manually handled instead of showing empty receipt links. No database migration is required.

### Workflow correction switches

The session correction section includes every guided stage, including signature, payments and receipts. Its switches use the same effective status as the progress checklist, including contract preparation and signing. Corrections are explicit checklist overrides; they do not change signed contracts, payment records, balances or Morning receipts. This also allows historical stages to be reconciled without deducting payments again. Turning a switch off overrides automatic completion; turning it on marks the checklist stage complete. Normal manual stage advancement clears that stage's override.

Switches save in the background and refresh the session card without navigating or reloading the window. Expanded sections and unsaved session-detail edits are retained. A failed save restores the switch and displays an inline error. No migration, additional framework or hosting service is required.

## Dashboard, deadlines, client editing and session management

No additional database migration is required. After deployment, login opens `/clients/dashboard`; the client directory stays at `/clients`, and `/clients/overview` shows business totals. All three pages use the existing authenticated management navigation.

- **Dashboard:** shows the next ten scheduled, unfinished shoots and a paginated list of active work. Filter by contract, payment/receipt, editing, delivery, review or calendar stage. Overdue deliveries sort first. Stage calculations reuse the profile's corrections and recorded evidence. Cancelled sessions are excluded.
- **Delivery:** due at the end of the date 14 calendar days after the saved session date, using Israel's current date. The deadline remains visible on the profile and recalculates when the shoot date changes. Missing dates are called out, never inferred from the day a checklist was clicked. No follow-up dates or automatic messages were added.
- **Client details:** explicitly open “עריכת פרטי לקוח”, edit, then choose “אישור ושמירת השינויים”. Fields are hidden and disabled before opening; cancel or Escape discards unsaved edits. Israeli mobile numbers are normalized and an existing client's phone cannot be reused. Changing a phone invalidates unsigned links bound to the old number; prepare a new contract link. Issued documents remain unchanged.
- **Reschedule:** open “שינוי מועד או ביטול הסשן”, choose the new date and explicitly save. The previous date is retained and a stale-date submission is rejected. Existing progress, contracts and payments are preserved. Update the existing Google Calendar event manually, then acknowledge it on the profile. Creating a calendar event is not evidence that an existing event was updated.
- **Cancel/restore:** cancellation is behind an additional disclosure, requires a reason and an explicit submit button, and preserves all financial and contract history. Cancelled sessions stop accepting ordinary workflow/payment changes and unsigned contract links are unavailable while cancelled. Payment receipt recovery stays accessible. Restore explicitly to resume the existing workflow. Cancellation/restoration flags the calendar for manual review and does not issue refunds or void receipts.
- **Overview:** receipts received are summed from recorded payment amounts by `paid_on` for the selected month, including cancelled bookings. Outstanding balances are current across all months, with cancelled balances separated. Completed shoots and package counts use the saved shoot date and effective `shoot_done` state, excluding cancellations. Historical payments are not inferred from balances; undated completed shoots are reported separately. These are operational totals, not profit or refund accounting.

Verification includes date arithmetic across daylight-saving changes, year/month boundaries, cancellation exclusion, correction overrides, monthly payment attribution, client validation/confirmation, and rescheduling guards. Tests mock provider/database requests and do not contact clients.
