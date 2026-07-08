const fs = require('fs');
const path = require('path');
const pdfMake = require('pdfmake');

pdfMake.setFonts(require('pdfmake/standard-fonts/Helvetica'));

const LOGO_PATH = path.join(__dirname, 'assets/logo.jpeg');
const LOGO_DATA_URL = `data:image/jpeg;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`;

const BRAND_GREEN = '#2E7D32';

// ============================================================================
// buildQuotePdf - arma el PDF de la cotización con pdfmake y regresa un Buffer
// ============================================================================
async function buildQuotePdf({ schoolName, levelLabel, grade, sexLabel, items, subtotal, iva, total }) {
  const tableBody = [
    [
      { text: 'Producto', style: 'tableHeader' },
      { text: 'Cant.', style: 'tableHeader', alignment: 'center' },
      { text: 'Precio', style: 'tableHeader', alignment: 'right' },
      { text: 'Importe', style: 'tableHeader', alignment: 'right' }
    ],
    ...items.map(item => ([
      item.name,
      { text: String(item.quantity), alignment: 'center' },
      { text: `$${item.unitPrice.toFixed(2)}`, alignment: 'right' },
      { text: `$${item.subtotal.toFixed(2)}`, alignment: 'right' }
    ]))
  ];

  const docDefinition = {
    pageMargins: [40, 100, 40, 60],
    header: {
      margin: [40, 25, 40, 0],
      columns: [
        { image: LOGO_DATA_URL, width: 80 },
        { text: 'Distribuidora Papelera México', style: 'brandName', alignment: 'right', margin: [0, 25, 0, 0] }
      ]
    },
    footer: {
      margin: [40, 0, 40, 20],
      text: 'Anticipo requerido: $100.00. El resto se paga al recoger o al entregar tu pedido.',
      fontSize: 8,
      color: '#777777'
    },
    content: [
      { text: 'Cotización', style: 'title' },
      { text: `${schoolName} — ${grade}° de ${levelLabel} (${sexLabel})`, style: 'subtitle', margin: [0, 0, 0, 15] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 40, 70, 70],
          body: tableBody
        },
        layout: {
          hLineColor: () => '#dddddd',
          vLineColor: () => '#dddddd',
          paddingTop: () => 5,
          paddingBottom: () => 5
        }
      },
      {
        columns: [
          { text: '', width: '*' },
          {
            width: 160,
            margin: [0, 12, 0, 0],
            table: {
              widths: ['*', 'auto'],
              body: [
                ['Subtotal', { text: `$${subtotal.toFixed(2)}`, alignment: 'right' }],
                ['IVA 16%', { text: `$${iva.toFixed(2)}`, alignment: 'right' }],
                [{ text: 'Total', bold: true }, { text: `$${total.toFixed(2)}`, alignment: 'right', bold: true }]
              ]
            },
            layout: 'noBorders'
          }
        ]
      }
    ],
    styles: {
      title: { fontSize: 20, bold: true, color: BRAND_GREEN },
      subtitle: { fontSize: 11, color: '#555555' },
      brandName: { fontSize: 13, bold: true, color: BRAND_GREEN },
      tableHeader: { bold: true, color: 'white', fillColor: BRAND_GREEN }
    },
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 10
    }
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  return await pdfDoc.getBuffer();
}

module.exports = { buildQuotePdf };
