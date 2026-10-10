export type ContractLocale = 'he' | 'ru';

// v1 is pinned in signed invitations. Keep these assets stable after issuance;
// future wording/layout versions need their own mapping and asset filenames.
export function contractPresentation(locale: ContractLocale, conf: string) {
  const ru = locale === 'ru';
  return {
    template: ru
      ? conf === '1'
        ? '/contract_template_ru_fillable.pdf'
        : '/contract_template_conf_ru_fillable.pdf'
      : conf === '1'
        ? '/contract_template_fillable.pdf'
        : '/contract_template_conf_fillable.pdf',
    font: ru ? '/fonts/Rubik-Regular.ttf' : '/fonts/NotoSansHebrew-Regular.ttf',
    contractPath: ru ? '/ru/contract' : '/contract',
    thankYouPath: ru ? '/ru/thank_you' : '/thank_you',
    dateLocale: ru ? 'ru-RU' : 'he-IL',
  };
}
