import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Generate liquidation report in PDF or Excel format (hardcoded data)
 * @param {'pdf'|'excel'} format
 */
export async function generateLiquidationReport(format = 'pdf') {
    const data = getHardcodedData();
    const processedData = processVoucherData(data);

    if (format === 'pdf') {
        return generatePDFReport(processedData);
    } else if (format === 'excel') {
        return generateExcelReport(processedData);
    } else {
        throw new Error('Invalid format. Use "pdf" or "excel"');
    }
}

function getHardcodedData() {
    return {
        projectInfo: {
            projectName: 'UNICEF Project',
            requestDate: '9 December 2024',
            checkIssueDate: '11 December 2024',
            checkNumber: '2000000275',
            cashAdvanceAmount: 178000,
            submittedBy: 'ANGELI E.S. DOMINGO'
        },
        vouchers: [
            // Personnel Services
            {
                dvNumber: '24-148',
                date: '24-Jun-2025',
                payeeName: 'Patrick Lyndon Genar A. Rodriguez',
                description: 'Layout services',
                grossAmount: 8000,
                taxAmount: 800,
                type: 'personnel',
                remarks: 'Layout'
            },
            {
                dvNumber: '24-149',
                date: '24-Jun-2025',
                payeeName: 'John Jerry A. Maramag',
                description: 'Illustration services',
                grossAmount: 20000,
                taxAmount: 2000,
                type: 'personnel',
                remarks: 'Illustrator'
            },
            {
                dvNumber: '24-155',
                date: '24-Jun-2025',
                payeeName: 'Sheryl Lyn C. Monterola',
                description: 'Project Direction',
                grossAmount: 15000,
                taxAmount: 1500,
                type: 'personnel',
                remarks: 'Project Director'
            },
            {
                dvNumber: '24-154',
                date: '24-Jun-2025',
                payeeName: 'Monalisa T. Sasing',
                description: 'Project Leadership',
                grossAmount: 30000,
                taxAmount: 3000,
                type: 'personnel',
                remarks: 'Project Leader'
            },
            {
                dvNumber: '24-150',
                date: '24-Jun-2025',
                payeeName: 'Maria Helen DH. Catalan',
                description: 'Learning Materials Review',
                grossAmount: 20000,
                taxAmount: 2000,
                type: 'personnel',
                remarks: 'Reviewer of LEs'
            },
            {
                dvNumber: '24-151',
                date: '24-Jun-2025',
                payeeName: 'Michael Anthony B. Mantala',
                description: 'Writing Learning Materials',
                grossAmount: 30000,
                taxAmount: 3000,
                type: 'personnel',
                remarks: 'Writer of 3 LEs'
            },
            {
                dvNumber: '24-152',
                date: '24-Jun-2025',
                payeeName: 'Rolando M. Tan',
                description: 'Writing Learning Materials',
                grossAmount: 30000,
                taxAmount: 3000,
                type: 'personnel',
                remarks: 'Writer of 3 LEs'
            },
            {
                dvNumber: '24-153',
                date: '24-Jun-2025',
                payeeName: 'Maria Michelle V. Junio',
                description: 'Writing Learning Materials',
                grossAmount: 10000,
                taxAmount: 1000,
                type: 'personnel',
                remarks: 'Writer of 1 LE'
            },
            // Support Staff
            {
                dvNumber: '24-156',
                date: '24-Jun-2025',
                payeeName: 'Angeli E.S. Domingo',
                description: 'Administrative Support',
                grossAmount: 3000,
                taxAmount: 300,
                type: 'personnel',
                remarks: 'Admin Support Staff'
            },
            {
                dvNumber: '24-157',
                date: '24-Jun-2025',
                payeeName: 'Nelson O. Mariano',
                description: 'Administrative Support',
                grossAmount: 2000,
                taxAmount: 200,
                type: 'personnel',
                remarks: 'Admin Support Staff'
            },
            {
                dvNumber: '24-158',
                date: '24-Jun-2025',
                payeeName: 'Rose Kathlyn G. Sinamban',
                description: 'Administrative Support',
                grossAmount: 3000,
                taxAmount: 300,
                type: 'personnel',
                remarks: 'Admin Support Staff'
            },
            {
                dvNumber: '24-159',
                date: '24-Jun-2025',
                payeeName: 'Rosemarie G. Bautista',
                description: 'Administrative Support',
                grossAmount: 2000,
                taxAmount: 200,
                type: 'personnel',
                remarks: 'Admin Support Staff'
            },
            // MOOE
            {
                dvNumber: '24-160',
                date: '24-Jun-2025',
                payeeName: 'Facility Provider',
                description: 'Use of facilities',
                grossAmount: 5000,
                taxAmount: 0,
                type: 'mooe',
                remarks: 'RA'
            },
            // Tax Withheld
            {
                dvNumber: '06-Dec-2024',
                date: '06-Dec-2024',
                payeeName: 'PNB',
                description: 'Tax Payment',
                grossAmount: 17300,
                taxAmount: 0,
                type: 'tax',
                remarks: 'Paid via PNB'
            }
        ]
    };
}

function processVoucherData(projectData) {
    const { projectInfo, vouchers } = projectData;
    const categories = {
        'A. Personnel Services': [],
        'B. MOOE': [],
        'C. Tax Withheld': []
    };

    let totalPersonnelServices = 0;
    let totalMOOE = 0;
    let totalTaxWithheld = 0;

    vouchers.forEach(voucher => {
        const category = determineCategory(voucher);
        const grossAmount = parseFloat(voucher.grossAmount || 0);
        const taxAmount = parseFloat(voucher.taxAmount || 0);
        const netAmount = grossAmount - taxAmount;

        const processedVoucher = {
            ...voucher,
            grossAmount,
            taxAmount,
            netAmount,
            dvNumber: voucher.dvNumber || generateDVNumber(),
            date: voucher.date || new Date().toLocaleDateString()
        };

        categories[category].push(processedVoucher);

        if (category === 'A. Personnel Services') {
            totalPersonnelServices += netAmount;
        } else if (category === 'B. MOOE') {
            totalMOOE += netAmount;
        } else if (category === 'C. Tax Withheld') {
            totalTaxWithheld += grossAmount;
        }
    });

    const totalAmount = totalPersonnelServices + totalMOOE + totalTaxWithheld;

    return {
        projectInfo,
        categories,
        totals: {
            personnelServices: totalPersonnelServices,
            mooe: totalMOOE,
            taxWithheld: totalTaxWithheld,
            total: totalAmount
        },
        cashAdvanceBalance: totalAmount - (projectInfo.cashAdvanceAmount || 0)
    };
}

function determineCategory(voucher) {
    const type = voucher.type?.toLowerCase() || '';
    const description = voucher.description?.toLowerCase() || '';

    if (type.includes('personnel') || type.includes('salary') || type.includes('wage') ||
        description.includes('layout') || description.includes('illustrator') ||
        description.includes('consultant') || description.includes('writer') ||
        description.includes('support staff')) {
        return 'A. Personnel Services';
    } else if (type.includes('tax') || description.includes('tax') || description.includes('withheld')) {
        return 'C. Tax Withheld';
    } else {
        return 'B. MOOE';
    }
}

function generateDVNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${year}-${month}${random}`;
}

function generatePDFReport(data) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('UNICEF Project', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Liquidation Report for the PHP ${data.totals.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Cash Advance from FPSMER Requested on ${data.projectInfo.requestDate}; Check Issued on ${data.projectInfo.checkIssueDate}`, 14, 45);
    doc.text(`(Check No.: ${data.projectInfo.checkNumber})`, 14, 52);
    doc.text(`${data.totals.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 30, 52, { align: 'right' });

    const summaryData = [
        ['A. Personnel Services', '', '', data.totals.personnelServices.toLocaleString('en-PH', { minimumFractionDigits: 2 })],
        ['B. MOOE', '', '', data.totals.mooe.toLocaleString('en-PH', { minimumFractionDigits: 2 })],
        ['C. Tax Withheld', '', '', data.totals.taxWithheld.toLocaleString('en-PH', { minimumFractionDigits: 2 })],
        ['', '', '', ''],
        ['Less expenses incurred (see summary of expenses below)', '', '', data.totals.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })]
    ];

    doc.autoTable({
        startY: 60,
        head: [['', '', '', '']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30, halign: 'right' }
        }
    });

    let startY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Summary of Expenses Incurred', 14, startY);

    const headers = [['DV No./Date', 'Particulars', 'Gross', '10% Tax', 'Net Amount', 'Total', 'Remarks']];

    Object.entries(data.categories).forEach(([categoryName, vouchers]) => {
        if (vouchers.length === 0) return;

        startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : startY + 10;

        const categoryData = [[categoryName, '', '', '', '', '', '']];

        vouchers.forEach(voucher => {
            categoryData.push([
                `${voucher.dvNumber}\n${voucher.date}`,
                `${voucher.payeeName}\n${voucher.description}`,
                voucher.grossAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
                voucher.taxAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
                voucher.netAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
                '',
                voucher.remarks || ''
            ]);
        });

        doc.autoTable({
            startY: startY,
            head: categoryName === 'A. Personnel Services' ? headers : [],
            body: categoryData,
            theme: 'grid',
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 45 },
                2: { cellWidth: 25, halign: 'right' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 25, halign: 'right' },
                6: { cellWidth: 25 }
            }
        });
    });

    startY = doc.lastAutoTable.finalY + 10;
    doc.autoTable({
        startY: startY,
        body: [['Cash Advance Balance', '', '', '', '', data.cashAdvanceBalance.toFixed(2), '']],
        theme: 'grid',
        styles: { fontSize: 9, fillColor: [255, 255, 0] },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 45 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25, halign: 'right' },
            6: { cellWidth: 25 }
        }
    });

    startY = doc.lastAutoTable.finalY + 20;
    doc.text('Submitted by:', 14, startY);
    doc.setFont(undefined, 'bold');
    doc.text(data.projectInfo.submittedBy || 'ANGELI E.S. DOMINGO', 14, startY + 10);
    doc.setFont(undefined, 'normal');
    doc.text('Administrative Officer V', 14, startY + 17);
    doc.text('UP NISMED', 14, startY + 24);

    doc.save(`liquidation-report-${data.projectInfo.projectName || 'unicef'}-${new Date().toISOString().split('T')[0]}.pdf`);
}

function generateExcelReport(data) {
    const workbook = XLSX.utils.book_new();

    const sheetData = [
        ['UNICEF Project'],
        [`Liquidation Report for the PHP ${data.totals.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
        [''],
        [`Cash Advance from FPSMER Requested on ${data.projectInfo.requestDate}; Check Issued on ${data.projectInfo.checkIssueDate}`],
        [`(Check No.: ${data.projectInfo.checkNumber})`, '', '', data.totals.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })],
        [''],
        ['A. Personnel Services', '', '', data.totals.personnelServices.toLocaleString('en-PH', { minimumFractionDigits: 2 })],
        ['B. MOOE', '', '', data.totals.mooe.toLocaleString('en-PH', { minimumFractionDigits: 2 })],
        ['C. Tax Withheld', '', '', data.totals.taxWithheld.toLocaleString('en-PH', { minimumFractionDigits: 2 })],
        [''],
        ['Less expenses incurred (see summary of expenses below)', '', '', data.totals.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })],
        [''],
        ['Summary of Expenses Incurred'],
        ['DV No./Date', 'Particulars', 'Gross', '10% Tax', 'Net Amount', 'Total', 'Remarks']
    ];

    Object.entries(data.categories).forEach(([categoryName, vouchers]) => {
        if (vouchers.length === 0) return;

        sheetData.push([categoryName]);

        vouchers.forEach(voucher => {
            sheetData.push([
                `${voucher.dvNumber} ${voucher.date}`,
                `${voucher.payeeName} - ${voucher.description}`,
                voucher.grossAmount,
                voucher.taxAmount,
                voucher.netAmount,
                '',
                voucher.remarks || ''
            ]);
        });

        sheetData.push(['']);
    });

    sheetData.push(['Cash Advance Balance', '', '', '', '', data.cashAdvanceBalance.toFixed(2), '']);
    sheetData.push(['']);
    sheetData.push(['Submitted by:']);
    sheetData.push([data.projectInfo.submittedBy || 'ANGELI E.S. DOMINGO']);
    sheetData.push(['Administrative Officer V']);
    sheetData.push(['UP NISMED']);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Liquidation Report');
    XLSX.writeFile(workbook, `liquidation-report-${data.projectInfo.projectName || 'unicef'}-${new Date().toISOString().split('T')[0]}.xlsx`);
}