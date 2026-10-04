export const manualSteps = [
  ['contract_sent', 'החוזה נשלח'],
  ['calendar_added', 'הסשן נוסף ליומן'],
  ['shoot_done', 'הצילומים הסתיימו'],
  ['editing_started', 'העריכה התחילה'],
  ['editing_done', 'העריכה הסתיימה'],
  ['pixieset_uploaded', 'התמונות המוקטנות הועלו ל־Pixieset'],
  ['fullsize_uploaded', 'התמונות המלאות הועלו ל־MyAirBridge'],
  ['delivered', 'הקישורים נשלחו ללקוח'],
  ['review_requested', 'הבקשה לביקורת נשלחה'],
] as const;
export type Workflow = Record<string, string | undefined>;
export type Client = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  session_count?: string;
};
export type Session = {
  id: number;
  client_id: number;
  session_type: string;
  package_type: number;
  session_price: string | number;
  to_pay: string | number;
  contract_signed: boolean;
  workflow: Workflow;
};
export type Payment = {
  session_id: number;
  id: string;
  stage: string;
  amount: number | string;
  receipt_status: string;
  receipt_url?: string;
  paid_on: string;
};
export function stepsFor(
  session: { workflow?: Workflow; contract_signed?: boolean; to_pay: number | string },
  payments: Payment[]
) {
  const w = session.workflow || {};
  const payment = (stage: string) => payments.find((p) => p.stage === stage);
  return [
    {
      key: 'contract_sent',
      label: 'הכנת חוזה לשליחה',
      done: !!w.contract_prepared || !!w.contract_sent || !!session.contract_signed,
    },
    { key: 'signed', label: 'המתנה לחתימת חוזה', done: !!session.contract_signed },
    { key: 'deposit', label: 'קבלת ₪100 לסגירת התאריך', done: !!payment('deposit') },
    { key: 'deposit_receipt', label: 'הפקת קבלה על ₪100', done: payment('deposit')?.receipt_status === 'issued' },
    { key: 'calendar_added', label: 'הוספה ליומן', done: !!w.calendar_added },
    { key: 'shoot_done', label: 'יום הצילומים', done: !!w.shoot_done },
    { key: 'balance', label: 'קבלת יתרת התשלום', done: Number(session.to_pay) === 0 },
    { key: 'balance_receipt', label: 'הפקת קבלה על היתרה', done: payment('balance')?.receipt_status === 'issued' },
    { key: 'editing_done', label: 'עריכת התמונות', done: !!w.editing_done },
    { key: 'delivered', label: 'העלאה ומסירת התמונות', done: !!w.delivered },
    { key: 'review_requested', label: 'בקשת ביקורת', done: !!w.review_requested },
  ].map((step) => ({
    ...step,
    done: w[`override_${step.key}`] === '1' ? true : w[`override_${step.key}`] === '0' ? false : step.done,
  }));
}
export function safeWebUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2000) throw new Error('Invalid URL');
  if (!value.trim()) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid URL');
  return url.toString();
}
export function validId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid ID');
  return id;
}
