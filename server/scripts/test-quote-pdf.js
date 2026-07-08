// Script para generar un PDF de cotización de prueba y revisarlo localmente,
// sin tocar MongoDB ni mandar nada por WhatsApp.
// Se corre con: node scripts/test-quote-pdf.js
// Genera cotizacion-prueba.pdf en la raíz de server/

const fs = require('fs');
const path = require('path');
const { buildQuotePdf } = require('../src/bot/pdf-generator');

async function run() {
  const buffer = await buildQuotePdf({
    schoolName: 'Colegio Lincoln de Tuxtla',
    levelLabel: 'Primaria',
    grade: '4',
    sexLabel: 'Niña',
    items: [
      { name: 'Cuaderno profesional cuadro chico', quantity: 3, unitPrice: 25.5, subtotal: 76.5 },
      { name: 'Colores 24 piezas', quantity: 1, unitPrice: 65, subtotal: 65 },
      { name: 'Mochila con ruedas', quantity: 1, unitPrice: 450, subtotal: 450 }
    ],
    subtotal: 591.5,
    iva: 94.64,
    total: 686.14
  });

  const outputPath = path.join(__dirname, '../cotizacion-prueba.pdf');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ PDF generado en: ${outputPath}`);
}

run().catch(err => {
  console.error('❌ Error generando PDF:', err);
  process.exit(1);
});
