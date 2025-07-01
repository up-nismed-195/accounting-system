import * as XLSX from 'xlsx';

/**
 * Generate liquidation report in Excel format using actual data
 * @param {Array} liquidationsData - Array of liquidation records from Supabase
 * @param {Object} projectInfo - Project information object
 */
export function generateLiquidationReport(liquidationsData = [], projectInfo = {}) {
    if (!liquidationsData || liquidationsData.length === 0) {
        console.warn('No liquidation data provided for Excel generation');
        alert('No liquidation data available to generate report');
        return;
    }

    const processedData = processLiquidationData(liquidationsData, projectInfo);
    generateExcelReport(processedData);
}

/**
 * Test function: Generate liquidation report in Excel format using hardcoded data
 */
export function testGenerateLiquidationReport() {
    // Hardcoded sample data matching your format
    const liquidationsData = [
        {
            dv_no: 'UNESCO-25-001',
            voucher_date: '2025-06-30',
            payee_name: 'seth limbo',
            particulars: 'Consultant Services',
            tin_no: '123-456-789',
            gross: 1000,
            amount_taxed: 0,
            net_amount: 1000,
            remarks: 'Personnel'
        },
        {
            dv_no: 'UNESCO-25-002',
            voucher_date: '2025-06-30',
            payee_name: 'seth limbo',
            particulars: 'Additional Services',
            tin_no: '123-456-789',
            gross: 1000,
            amount_taxed: 0,
            net_amount: 1000,
            remarks: 'Personnel'
        },
        {
            dv_no: 'UNESCO-25-003',
            voucher_date: '2025-06-30',
            payee_name: 'a',
            particulars: 'Equipment rental',
            tin_no: '555-666-777',
            gross: 0,
            amount_taxed: 0,
            net_amount: 0,
            remarks: 'MOOE'
        }
    ];

    const projectInfo = {
        name: 'UNICEF Project',
        code: 'UNESCO',
        requestDate: '2024-12-09',
        checkIssueDate: '2024-12-11',
        checkNumber: '200000275',
        submittedBy: 'ANGELI E.S. DOMINGO'
    };

    generateLiquidationReport(liquidationsData, projectInfo);
}

/**
 * Process liquidation data from Supabase into the format needed for Excel generation
 */
function processLiquidationData(liquidationsData, projectInfo) {
    // Calculate totals
    const totals = liquidationsData.reduce((acc, item) => {
        const gross = parseFloat(item.gross) || 0;
        const taxed = parseFloat(item.amount_taxed) || 0;
        const net = parseFloat(item.net_amount) || 0;

        acc.total += gross;
        acc.taxWithheld += taxed;
        acc.netTotal += net;

        return acc;
    }, {
        total: 0,
        taxWithheld: 0,
        netTotal: 0,
        personnelServices: 0,
        mooe: 0
    });

    // Categorize expenses based on remarks or particulars
    const categories = {
        'A. Personnel Services': [],
        'B. MOOE': [],
        'C. Tax Withheld': []
    };

    liquidationsData.forEach((item, index) => {
        const voucher = {
            dvNumber: item.dv_no || `DV-${index + 1}`,
            date: formatDate(item.voucher_date),
            payeeName: item.payee_name || 'N/A',
            description: item.particulars || 'N/A',
            tinNo: item.tin_no || '',
            grossAmount: parseFloat(item.gross) || 0,
            taxAmount: parseFloat(item.amount_taxed) || 0,
            netAmount: parseFloat(item.net_amount) || 0,
            remarks: item.remarks || ''
        };

        // Categorization logic based on remarks or particulars
        if (voucher.remarks.toLowerCase().includes('personnel') || 
            voucher.description.toLowerCase().includes('salary') ||
            voucher.description.toLowerCase().includes('consultant')) {
            categories['A. Personnel Services'].push(voucher);
            totals.personnelServices += voucher.grossAmount;
        } else if (voucher.remarks.toLowerCase().includes('mooe') || 
                   voucher.description.toLowerCase().includes('supplies') || 
                   voucher.description.toLowerCase().includes('equipment') ||
                   voucher.description.toLowerCase().includes('facilities')) {
            categories['B. MOOE'].push(voucher);
            totals.mooe += voucher.grossAmount;
        }
    });

    return {
        totals,
        categories,
        cashAdvanceBalance: totals.total - totals.netTotal,
        projectInfo: {
            projectName: projectInfo.name || 'UNICEF Project',
            projectCode: projectInfo.code || 'N/A',
            requestDate: formatDate(projectInfo.requestDate) || '9 December 2024',
            checkIssueDate: formatDate(projectInfo.checkIssueDate) || '11 December 2024',
            checkNumber: projectInfo.checkNumber || 'N/A',
            submittedBy: projectInfo.submittedBy || 'ANGELI E.S. DOMINGO',
            totalAmount: totals.total
        }
    };
}

/**
 * Format date string to readable format
 */
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * Generate the actual Excel report
 */
function generateExcelReport(data) {
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet data array
    const wsData = [];
    
    // Add header rows
    wsData.push([`30-Jun-2025`]); // Date row
    wsData.push(['']); // Empty row
    wsData.push([data.projectInfo.projectName]); // Project name
    wsData.push(['']); // Empty row
    wsData.push([`Liquidation Report for PHP ${data.projectInfo.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`]);
    wsData.push(['']); // Empty row
    
    // Cash advance info
    wsData.push([`Cash Advance from FPSMER Requested on ${data.projectInfo.requestDate}; Check Issued on ${data.projectInfo.checkIssueDate}`, '', '', '', '', '', `${data.projectInfo.totalAmount.toFixed(2)}`]);
    wsData.push([`(Check No.: ${data.projectInfo.checkNumber})`]);
    wsData.push(['']); // Empty row
    
    // Summary section
    wsData.push(['A. Personnel Services', '', '', `${data.totals.personnelServices.toFixed(2)}`]);
    wsData.push(['']); // Empty row
    wsData.push(['B. MOOE', '', '', `${data.totals.mooe.toFixed(2)}`]);
    wsData.push(['']); // Empty row
    wsData.push(['C. Tax withheld', '', '', `${data.totals.taxWithheld.toFixed(2)}`]);
    wsData.push(['']); // Empty row
    wsData.push(['']); // Empty row
    wsData.push(['Less expenses incurred (see summary of expenses below)', '', '', `${data.projectInfo.totalAmount.toFixed(2)}`]);
    wsData.push(['']); // Empty row
    wsData.push(['Summary of Expenses Incurred']);
    wsData.push(['']); // Empty row
    
    // Table headers
    wsData.push(['DV No. / Date', 'Particulars', '', 'Gross', '10% Tax', 'Net Amount', 'Total', '', 'Remarks']);
    wsData.push(['']); // Empty row
    
    // A. Personnel Services section
    if (data.categories['A. Personnel Services'].length > 0) {
        wsData.push(['A. Personnel Services', '', '', '', '', '', `${data.totals.personnelServices.toFixed(2)}`]);
        
        // Add subcategories
        const personnelCategories = {
            'Layout/Illustrator': [],
            'Consultant/Project Leader/Reviewer': [],
            'Writers of LEs': [],
            'Support Staff': []
        };
        
        // Categorize personnel based on remarks or names
        data.categories['A. Personnel Services'].forEach(voucher => {
            if (voucher.remarks.toLowerCase().includes('layout') || 
                voucher.remarks.toLowerCase().includes('illustrator')) {
                personnelCategories['Layout/Illustrator'].push(voucher);
            } else if (voucher.remarks.toLowerCase().includes('project') || 
                       voucher.remarks.toLowerCase().includes('consultant') ||
                       voucher.remarks.toLowerCase().includes('reviewer')) {
                personnelCategories['Consultant/Project Leader/Reviewer'].push(voucher);
            } else if (voucher.remarks.toLowerCase().includes('writer')) {
                personnelCategories['Writers of LEs'].push(voucher);
            } else {
                personnelCategories['Support Staff'].push(voucher);
            }
        });
        
        // Add personnel subcategories
        Object.entries(personnelCategories).forEach(([categoryName, vouchers]) => {
            if (vouchers.length > 0) {
                wsData.push([categoryName]);
                vouchers.forEach(voucher => {
                    wsData.push([
                        voucher.dvNumber,
                        voucher.payeeName,
                        voucher.tinNo || '',
                        voucher.grossAmount.toFixed(2),
                        voucher.taxAmount.toFixed(2),
                        voucher.netAmount.toFixed(2),
                        '',
                        '',
                        voucher.remarks
                    ]);
                });
                wsData.push(['']); // Empty row after each subcategory
            }
        });
    }
    
    // B. MOOE section
    if (data.categories['B. MOOE'].length > 0) {
        wsData.push(['B. MOOE', '', '', '', '', '', `${data.totals.mooe.toFixed(2)}`]);
        data.categories['B. MOOE'].forEach(voucher => {
            wsData.push([
                voucher.dvNumber,
                voucher.description,
                '',
                voucher.grossAmount.toFixed(2),
                '',
                voucher.netAmount.toFixed(2),
                '',
                'RA',
                ''
            ]);
        });
        wsData.push(['']); // Empty row
    }
    
    // C. Tax Withheld section
    if (data.totals.taxWithheld > 0) {
        wsData.push(['C. Tax Withheld', '', '', '', '', '', `${data.totals.taxWithheld.toFixed(2)}`]);
        wsData.push(['06-Dec-2024', 'Paid via PNB', '', `${data.totals.taxWithheld.toFixed(2)}`, '', `${data.totals.taxWithheld.toFixed(2)}`]);
        wsData.push(['']); // Empty row
    }
    
    // Cash Advance Balance
    wsData.push(['', '', '', '', '', 'Cash Advance Balance', '0.00']);
    wsData.push(['']); // Empty row
    wsData.push(['']); // Empty row
    
    // Signature section
    wsData.push(['Submitted by:']);
    wsData.push(['']);
    wsData.push([data.projectInfo.submittedBy]);
    wsData.push(['Administrative Officer V']);
    wsData.push(['UP NISMED']);
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = [
        { wch: 15 }, // DV No./Date
        { wch: 35 }, // Particulars
        { wch: 15 }, // TIN No.
        { wch: 12 }, // Gross
        { wch: 10 }, // 10% Tax
        { wch: 12 }, // Net Amount
        { wch: 12 }, // Total
        { wch: 8 },  // Empty column
        { wch: 20 }  // Remarks
    ];
    worksheet['!cols'] = colWidths;
    
    // Add some basic styling for headers
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Style the project name (row 3)
    if (worksheet['A3']) {
        worksheet['A3'].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: 'center' }
        };
    }
    
    // Style the liquidation report title (row 5)
    if (worksheet['A5']) {
        worksheet['A5'].s = {
            font: { bold: true, sz: 12 },
            alignment: { horizontal: 'center' }
        };
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Liquidation Report');
    
    // Generate filename
    const fileName = `${data.projectInfo.projectName.replace(/\s+/g, '_')}_Liquidation_Report.xlsx`;
    
    // Save the file
    XLSX.writeFile(workbook, fileName);
    
    console.log(`Excel report generated: ${fileName}`);
}