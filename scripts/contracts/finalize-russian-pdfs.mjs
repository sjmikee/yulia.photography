// Run after build-russian-pdfs.py. Preserve the Hebrew field schema and embed a
// Cyrillic-capable font for field appearances. No live contracts are submitted.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PDFDocument, PDFName, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
const fontDir = process.env.CONTRACT_FONT_DIR || 'public/fonts';
const fontBytes = await readFile(join(fontDir, 'Rubik-Regular.ttf'));
const hebrew = await PDFDocument.load(await readFile('public/contract_template_fillable.pdf'));
const schema = (doc) =>
  doc
    .getForm()
    .getFields()
    .map((f) => `${f.getName()}:${f.constructor.name}`)
    .sort();
for (const variant of ['standard', 'confidential']) {
  const doc = await PDFDocument.load(await readFile(`tmp/pdfs/contract-ru-${variant}-base.pdf`));
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes);
  const form = doc.getForm();
  form.acroForm.dict.lookup(PDFName.of('DR')).lookup(PDFName.of('Font')).set(PDFName.of(font.name), font.ref);
  for (const field of form.getFields()) field.updateAppearances(font);
  for (const [name, x] of [
    ['client_sign_af_image', 50],
    ['my_sign_af_image', 350],
  ]) {
    const button = form.createButton(name);
    button.addToPage('', doc.getPages()[1], {
      x,
      y: 55,
      width: 150,
      height: 60,
      borderWidth: 0,
      backgroundColor: rgb(244 / 255, 244 / 255, 244 / 255),
      font,
    });
    // Transparent placeholders must not cover signatures drawn before flattening.
    button.updateAppearances(font, () => ({ normal: [] }));
    // Match the original single-widget field structure. pdf-lib 1.17.1 can
    // leave dangling annotation references when flattening child button widgets.
    const widgetRef = button.acroField.dict.lookup(PDFName.of('Kids')).get(0);
    const widget = doc.context.lookup(widgetRef);
    for (const [key, value] of widget.entries()) {
      if (key !== PDFName.of('Parent')) button.acroField.dict.set(key, value);
    }
    button.acroField.dict.delete(PDFName.of('Kids'));
    const annots = doc.getPages()[1].node.Annots();
    annots.set(annots.indexOf(widgetRef), button.ref);
    doc.context.delete(widgetRef);
  }
  if (JSON.stringify(schema(doc)) !== JSON.stringify(schema(hebrew))) throw new Error('Field schema mismatch');
  const target =
    variant === 'standard'
      ? 'public/contract_template_ru_fillable.pdf'
      : 'public/contract_template_conf_ru_fillable.pdf';
  await writeFile(target, await doc.save());
  // A local filled preview exercises the same eight fields and flattening as
  // submit_contract, using a Cyrillic-capable font. Never sent to clients.
  const values = {
    client_name: 'Анна Александровна Иванова',
    client_id: '123456789',
    client_address: 'ул. Герцля, 25, квартира 12, Холон',
    client_phone: '0521234567',
    date_1: '10.10.2026',
    type: 'Полтора часа',
    price: '1 300',
    date_2: '10.10.2026',
  };
  for (const [name, value] of Object.entries(values)) {
    const field = form.getTextField(name);
    field.setText(value);
    field.setFontSize(10);
    field.updateAppearances(font);
  }
  doc.getPages()[1].drawText('TEST: client signature', { x: 55, y: 75, size: 12, font });
  doc.getPages()[1].drawText('TEST: photographer signature', { x: 355, y: 75, size: 10, font });
  form.flatten();
  await writeFile(`tmp/pdfs/contract-ru-${variant}-filled.pdf`, await doc.save());
  console.log(`${target}: 10 field names/types match Hebrew; Cyrillic filling and flattening passed`);
}
