const WeatherRecord = require('../models/WeatherRecord');
const { create: createXml } = require('xmlbuilder2');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

/**
 * GET /api/export?format=json|xml|csv|pdf|markdown
 */
async function exportData(req, res, next) {
  try {
    const format = (req.query.format || 'json').toLowerCase();
    const validFormats = ['json', 'xml', 'csv', 'pdf', 'markdown'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: `Invalid format. Choose from: ${validFormats.join(', ')}`,
      });
    }

    const records = await WeatherRecord.findAll({
      order: [['created_at', 'DESC']],
      raw: true,
    });

    // Flatten each record to exclude nested `weather_data` from exports
    const flat = records.map((r) => ({
      id: r.id,
      location_input: r.location_input,
      resolved_location: r.resolved_location,
      latitude: r.latitude,
      longitude: r.longitude,
      date_from: r.date_from,
      date_to: r.date_to,
      temperature_min_c: r.temperature_min,
      temperature_max_c: r.temperature_max,
      temperature_avg_c: r.temperature_avg,
      humidity_percent: r.humidity,
      wind_speed_mps: r.wind_speed,
      description: r.description,
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    // ── JSON ──
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.json"');
      return res.json({
        exported_at: new Date().toISOString(),
        timezone: 'UTC (ISO 8601)',
        author: 'Mrunal Kotkar',
        total: flat.length,
        records: flat,
      });
    }

    // ── XML ──
    if (format === 'xml') {
      const root = createXml({ version: '1.0' })
        .ele('WeatherRecords', {
          exportedAt: new Date().toISOString(),
          timezone: 'UTC (ISO 8601)',
          author: 'Mrunal Kotkar',
          total: flat.length,
        });

      for (const r of flat) {
        const rec = root.ele('Record');
        for (const [key, val] of Object.entries(r)) {
          rec.ele(key).txt(val !== null && val !== undefined ? String(val) : '');
        }
      }

      const xml = root.end({ prettyPrint: true });
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.xml"');
      return res.send(xml);
    }

    // ── CSV ──
    if (format === 'csv') {
      const parser = new Parser({ fields: flat.length ? Object.keys(flat[0]) : [] });
      const csv = parser.parse(flat);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.csv"');
      return res.send(csv);
    }

    // ── Markdown ──
    if (format === 'markdown') {
      let md = `# Weather Records Export\n\n`;
      md += `**Exported At:** ${new Date().toISOString()}  \n`;
      md += `**Author:** Mrunal Kotkar  \n`;
      md += `**Total Records:** ${flat.length}\n\n`;

      if (flat.length === 0) {
        md += '_No records found._\n';
      } else {
        const keys = Object.keys(flat[0]);
        md += `| ${keys.join(' | ')} |\n`;
        md += `| ${keys.map(() => '---').join(' | ')} |\n`;
        for (const r of flat) {
          const row = keys.map((k) => (r[k] !== null && r[k] !== undefined ? String(r[k]) : '')).join(' | ');
          md += `| ${row} |\n`;
        }
      }

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.md"');
      return res.send(md);
    }

    // ── PDF ──
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.pdf"');
      doc.pipe(res);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Weather Records Export', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Author: Mrunal Kotkar`, { align: 'center' });
      doc.text(`Exported: ${new Date().toISOString()} (UTC)`, { align: 'center' });
      doc.text(`All timestamps are in UTC (ISO 8601)`, { align: 'center' });
      doc.text(`Total Records: ${flat.length}`, { align: 'center' });
      doc.moveDown(1);

      if (flat.length === 0) {
        doc.fontSize(12).text('No records found.', { align: 'center' });
      } else {
        for (let i = 0; i < flat.length; i++) {
          const r = flat[i];
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(`Record ${i + 1}: ${r.resolved_location || r.location_input}`);
          doc.fontSize(9).font('Helvetica');

          const fields = [
            ['Date Range', `${r.date_from} → ${r.date_to}`],
            ['Coordinates', `${r.latitude}, ${r.longitude}`],
            ['Temp (min/avg/max °C)', `${r.temperature_min_c} / ${r.temperature_avg_c} / ${r.temperature_max_c}`],
            ['Humidity', `${r.humidity_percent}%`],
            ['Wind Speed', `${r.wind_speed_mps} m/s`],
            ['Description', r.description],
            ['Notes', r.notes || '—'],
            ['Created', r.created_at],
          ];

          for (const [label, val] of fields) {
            doc.text(`  ${label}: ${val !== null && val !== undefined ? val : '—'}`);
          }

          doc.moveDown(0.8);
          if (i < flat.length - 1) {
            doc
              .moveTo(40, doc.y)
              .lineTo(555, doc.y)
              .strokeColor('#cccccc')
              .stroke();
            doc.moveDown(0.5);
          }
        }
      }

      doc.end();
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { exportData };
