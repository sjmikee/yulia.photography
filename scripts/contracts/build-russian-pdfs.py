"""Build the approved Russian templates. Requires reportlab, pypdf and Rubik fonts.
Run from the repository root; intermediate files are written under tmp/pdfs.
Then run: node scripts/contracts/finalize-russian-pdfs.mjs
"""
import json
import os
from pathlib import Path
from pypdf import PdfReader
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor

FONT_DIR=Path(os.environ.get('CONTRACT_FONT_DIR','public/fonts'))
pdfmetrics.registerFont(TTFont('Contract',str(FONT_DIR/'Rubik-Regular.ttf')))
pdfmetrics.registerFont(TTFont('ContractBold',str(FONT_DIR/'Rubik-Bold.ttf')))
source=json.loads(Path('docs/contracts/ru.json').read_text())
work=Path('tmp/pdfs'); work.mkdir(parents=True,exist_ok=True)
logo=work/'original-logo.png'
logo.write_bytes(PdfReader('public/contract_template_fillable.pdf').pages[0].images[0].data)
W,H=595.5,842.25
BG=HexColor('#f4f4f4'); INK=HexColor('#252525')
body=ParagraphStyle('body',fontName='Contract',fontSize=9.4,leading=12.1,textColor=INK)
heading=ParagraphStyle('heading',fontName='ContractBold',fontSize=10.2,leading=13,textColor=INK)
labels={'client_name':'Ф. И. О. клиента','client_id':'Удостоверение личности','client_address':'Адрес','client_phone':'Телефон','date_1':'Дата подписания','type':'Продолжительность съёмки','price':'Общая стоимость (шекели)','date_2':'Дата'}

for variant in ('standard','confidential'):
 c=canvas.Canvas(str(work/f'contract-ru-{variant}-base.pdf'),pagesize=(W,H))
 c.setTitle('Договор на фотосъёмку'); c.setAuthor('Юлия Коренская')
 def paragraph(text,style=body):
  global y
  p=Paragraph(text,style); _,height=p.wrap(W-120,H)
  p.drawOn(c,60,y-height); y-=height+3
 def section(title,texts,bullets=True):
  global y
  y-=9; paragraph(title,heading)
  for text in texts: paragraph(('• '+text) if bullets else text)
 def field(name,x,label_y,width,label=None):
  label=label or labels[name]
  c.setFillColor(INK); c.setFont('Contract',9.4); c.drawString(x,label_y,label+':')
  start=x+pdfmetrics.stringWidth(label+':','Contract',9.4)+6
  c.acroForm.textfield(name=name,tooltip=labels[name],x=start,y=label_y-3,width=width-(start-x),height=16,borderWidth=0,fillColor=BG,textColor=INK,fontSize=10,forceBorder=False)
 def header(page):
  global y
  c.setFillColor(BG); c.rect(0,0,W,H,fill=1,stroke=0)
  c.drawImage(str(logo),25,H-125,width=220,height=94,mask='auto',preserveAspectRatio=True)
  c.setFillColor(INK); c.setFont('Contract',11)
  for i,text in enumerate(['Юлия Коренская','323683862','Тел.: 0525836940']): c.drawRightString(W-60,H-61-i*23,text)
  c.setStrokeColor(HexColor('#ff0000')); c.setLineWidth(1.1)
  c.line(60,H-139,W-60,H-139); c.line(60,H-177,W-60,H-177)
  c.setFont('Contract',17 if page==1 else 15)
  c.drawCentredString(W/2,H-164,'Договор на фотосъёмку'+(' (продолжение)' if page==2 else ''))
  y=H-187
 header(1)
 section('Стороны договора',['Фотограф: Юлия Коренская, удостоверение личности № 323683862, адрес: ул. Кехилат Варша, 5, Холон, телефон: 0525836940.'],False)
 field('client_name',60,y-12,475); y-=22
 field('client_id',60,y-12,270); field('client_phone',350,y-12,185); y-=22
 field('client_address',60,y-12,475); y-=22
 field('date_1',60,y-12,280); y-=25
 for title,texts in source['sections1']:
  if title=='Объём услуг':
   section(title,texts[:2],False)
   field('type',60,y-12,400); y-=22
   paragraph('• '+texts[2])
  elif title=='Условия оплаты':
   section(title,[])
   field('price',60,y-12,340); y-=22
   for text in texts: paragraph('• '+text)
  else: section(title,texts)
 print(variant,'page 1 text bottom',y); assert y>35
 c.showPage(); header(2)
 section('Профессиональное использование и продвижение (например, портфолио)',[source['publication'][variant]],False)
 for title,texts in source['sections2']: section(title,texts,title in ['Обработка, ретушь и исходные файлы (RAW)','Ответственность и страхование'])
 print(variant,'page 2 text bottom',y); assert y>135
 field('date_2',235,123,190)
 # The existing server draws signature images at (50,55,150,60) and (350,55,150,60).
 c.setStrokeColor(INK); c.setLineWidth(.4)
 c.line(50,52,220,52); c.line(350,52,520,52)
 c.setFont('Contract',9.4); c.drawString(50,38,'Подпись клиента'); c.drawString(350,38,'Подпись фотографа')
 c.save()
