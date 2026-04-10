import PDFDocument from 'pdfkit';

export class PDFService {
  static generateCitizenPDF(citizenData, requestData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        // Header
        doc.rect(0, 0, 612, 100).fill('#1e40af');
        doc.fillColor('#ffffff');
        doc.fontSize(28).font('Helvetica-Bold');
        doc.text('BALADIYA DIGITAL', 50, 30);
        doc.fontSize(14).font('Helvetica');
        doc.text('Fiche de Traitement de Demande', 50, 65);
        
        doc.fontSize(10);
        doc.text(`Réf: ${requestData._id || 'N/A'}`, 450, 40);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 450, 55);
        
        // Citizen Information
        doc.fillColor('#1f2937');
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('INFORMATIONS DU CITOYEN', 50, 130);
        doc.moveTo(50, 150).lineTo(562, 150).stroke('#e5e7eb');
        
        const citizenInfo = [
          ['Nom complet:', `${citizenData.firstName || ''} ${citizenData.lastName || ''}`],
          ['Email:', citizenData.email || 'Non spécifié'],
          ['Téléphone:', citizenData.phone || 'Non spécifié'],
          ['NIN:', citizenData.nin || 'Non spécifié'],
          ['Adresse:', citizenData.address || 'Non spécifiée']
        ];
        
        let y = 170;
        doc.fontSize(11).font('Helvetica-Bold');
        citizenInfo.forEach(([label, value]) => {
          doc.fillColor('#4b5563');
          doc.text(label, 50, y);
          doc.fillColor('#1f2937').font('Helvetica');
          doc.text(value, 200, y);
          doc.font('Helvetica-Bold');
          y += 25;
        });
        
        // Request Details
        y += 20;
        doc.fillColor('#1e40af');
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('DÉTAILS DE LA DEMANDE', 50, y);
        doc.moveTo(50, y + 20).lineTo(562, y + 20).stroke('#e5e7eb');
        
        const requestInfo = [
          ['Type:', requestData.subject || 'Non spécifié'],
          ['Description:', requestData.description || 'Aucune description'],
          ['Service:', requestData.serviceType || 'Non spécifié'],
          ['Date:', requestData.createdAt ? new Date(requestData.createdAt).toLocaleDateString('fr-FR') : 'Non spécifiée'],
          ['Statut:', requestData.status || 'En attente']
        ];
        
        y += 40;
        doc.fontSize(11).font('Helvetica-Bold');
        requestInfo.forEach(([label, value]) => {
          doc.fillColor('#4b5563');
          doc.text(label, 50, y);
          doc.fillColor('#1f2937').font('Helvetica');
          if (label === 'Description:') {
            doc.text(value, 200, y, { width: 362 });
            y += 40;
          } else {
            doc.text(value, 200, y);
            y += 25;
          }
          doc.font('Helvetica-Bold');
        });
        
        // Validation
        y += 30;
        doc.fillColor('#059669');
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('VALIDATION', 50, y);
        doc.moveTo(50, y + 20).lineTo(562, y + 20).stroke('#e5e7eb');
        
        y += 40;
        doc.fillColor('#1f2937').fontSize(11);
        doc.text('Cette demande a été traitée et validée.', 50, y);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 50, y + 20);
        doc.text(`Heure: ${new Date().toLocaleTimeString('fr-FR')}`, 50, y + 40);
        
        // Footer
        doc.rect(0, 750, 612, 42).fill('#f3f4f6');
        doc.fillColor('#6b7280').fontSize(9).font('Helvetica');
        doc.text('Document généré par Baladiya Digital', 50, 765);
        doc.text('© 2024 Administration Municipale', 50, 780);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default PDFService;