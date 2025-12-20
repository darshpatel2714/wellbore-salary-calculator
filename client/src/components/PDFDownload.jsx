import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateDisplay } from '../utils/salaryCalculations';
import { Icons } from './Icons';

function PDFDownload({ entries, month, year, monthlyTotal }) {

    const generatePDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');

        // Title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(99, 102, 241); // Primary color
        doc.text('Salary Calculator', 105, 18, { align: 'center' });

        // Subtitle
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Salary Slip - ${month} ${year}`, 105, 28, { align: 'center' });


        // Horizontal line
        doc.setLineWidth(0.5);
        doc.line(15, 33, 195, 33);

        // Table data
        const tableData = entries.map(entry => [
            formatDateDisplay(entry.date),
            entry.inTime,
            entry.outTime,
            entry.presentHours,
            entry.otHours,
            `Rs.${entry.presentAmount}`,
            `Rs.${entry.otAmount}`,
            `Rs.${entry.pf}`,
            `Rs.${entry.dailySalary}`
        ]);

        // Generate table
        autoTable(doc, {
            startY: 38,
            head: [[
                'Date', 'In Time', 'Out Time', 'Present Hrs', 'OT Hrs',
                'Present Amt', 'OT Amt', 'PF', 'Daily Salary'
            ]],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [26, 26, 46],
                fontSize: 8,
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 8,
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 18 },
                2: { cellWidth: 18 },
                3: { cellWidth: 18 },
                4: { cellWidth: 15 },
                5: { cellWidth: 22 },
                6: { cellWidth: 20 },
                7: { cellWidth: 18 },
                8: { cellWidth: 25 }
            }
        });

        // Total at bottom
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(76, 175, 80);
        doc.text(`Monthly Total: Rs.${monthlyTotal.toLocaleString('en-IN')}`, 105, finalY, { align: 'center' });

        // Footer
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, finalY + 10, { align: 'center' });

        // Save PDF
        doc.save(`Salary_Slip_${month}_${year}.pdf`);
    };

    return (
        <button className="pdf-btn" onClick={generatePDF}>
            <Icons.FileDown /> PDF डाउनलोड करें / Download PDF
        </button>
    );
}

export default PDFDownload;
