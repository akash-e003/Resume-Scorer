const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('dummy_resume.pdf'));

doc.fontSize(25).text('Akash Resume', 100, 100);
doc.fontSize(12).text('Experienced Full Stack Developer with skills in React, Node.js, Express, and MongoDB.', 100, 150);
doc.end();
