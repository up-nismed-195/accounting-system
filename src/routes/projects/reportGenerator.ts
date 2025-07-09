import { jsPDF } from "jspdf"

export function generateReport(reportData: LiquidationEntry[]) {
    // ===================== 
    // preamble declarations
    // =====================
    
    // declaring jsPDF object
    const doc = new jsPDF()
    doc.setFont("Times", "bold")
    doc.setFontSize(12)
    const date = new Date()

    // defining page "constants"
    const PAGE_WIDTH = 210
    const PAGE_HEIGHT = 297 
    const MARGIN = 20
    const TAB_RATIO = 1.4
    let current_height = MARGIN
    type align = "left" | "center" | "right" | "justify" | undefined

    // helper functions
    function addText(text: string, x: number=MARGIN, y:number=5, align: align="left") {
        doc.text(text, x, current_height, {align: align})
        current_height = current_height + y
    }

    function addLine(x: number=MARGIN, y:number=5) {
        doc.line(x, current_height, PAGE_WIDTH-x, current_height); // from (20,35) to (190,35)
        current_height += y
    }

    // function addVoucherEntry() {}
    
    // deriving data from database
    const project_code = reportData[0]?.project_code || "N/A"
    
    // Calculate totals from database entries
    const personnelServicesTotal = reportData.reduce((sum, entry) => sum + (entry.gross || 0), 0)
    const taxTotal = reportData.reduce((sum, entry) => sum + (entry.amount_taxed || 0), 0)
    const mooeTotal = reportData.reduce((sum, entry) => sum + (entry.mooe || 0), 0) // assuming MOOE field exists
    const cashAdvanceTotal = personnelServicesTotal + taxTotal + mooeTotal
    
    // Format numbers with commas
    const formatNumber = (num: number) => num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
    
    // Format today's date
    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }
        return date.toLocaleDateString('en-US', options)
    }

    // ==================
    // start of page body 
    // ==================
    
    // date
    doc.setFont("Times", "normal")
    doc.setFontSize(10)
    doc.setTextColor("#888888")
    doc.text(`Generated on ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`, MARGIN, current_height)
    doc.setFont("Times", "bold")
    doc.setFontSize(12)
    doc.setTextColor("black")

    // title
    doc.text(`${project_code} Project`, PAGE_WIDTH/2, current_height, { align: "center" });
    current_height += 6

    // project
    doc.text(`Liquidation report for the PHP ${formatNumber(cashAdvanceTotal)}`, PAGE_WIDTH/2, current_height, { align: "center" });
    current_height += 5

    // header-body dividing line
    addLine(MARGIN, 6)
   
    // -------------------------------------------------------------------------------------------------------
    
    doc.setFont("Times", "normal")
    doc.setFontSize(10)
    doc.setTextColor("black")
    
    doc.setFont("Times", "bold")
    addText("Cash Advance from FPSMER Inc.:", MARGIN, 0)
    doc.setFont("Times", "normal")
    addText(formatNumber(cashAdvanceTotal), PAGE_WIDTH-MARGIN, 5, "right")
    
    doc.setFont("Times", "normal")
    doc.setTextColor("#666666")
    // Use today's date for request date
    const requestDate = formatDate(new Date())
    const checkNumber = reportData[0]?.check_number || "2000000275"
    addText(`• Requested on ${requestDate}`, TAB_RATIO*MARGIN)
    addText(`• Check No.: ${checkNumber}`, TAB_RATIO*MARGIN)
    doc.setTextColor("black")
    doc.setFont("Times", "normal")

    doc.setFont("Times", "semibold")
    addText("A. Personal Services", TAB_RATIO*MARGIN, 0)
    doc.setFont("Times", "normal")
    addText(formatNumber(personnelServicesTotal), PAGE_WIDTH-MARGIN, 5, "right")

    doc.setFont("Times", "medium")
    addText("B. MOOE", TAB_RATIO*MARGIN, 0)
    doc.setFont("Times", "normal")
    addText(formatNumber(mooeTotal), PAGE_WIDTH-MARGIN, 5, "right")

    doc.setFont("Times", "medium")
    addText("C. Tax withheld", TAB_RATIO*MARGIN, 0)
    doc.setFont("Times", "normal")
    addText(formatNumber(taxTotal), PAGE_WIDTH-MARGIN, 7, "right")

    addText("Less expenses incurred (see summary of expenses below):", MARGIN, 0)
    addText(formatNumber(cashAdvanceTotal), PAGE_WIDTH-MARGIN, 4, "right")
    
    addLine()

    doc.setFont("Times", "bold");
    addText("Summary of expenses incurred", MARGIN, 7)
    
    doc.text(`Personnel Services`, MARGIN, current_height)
    doc.text(formatNumber(personnelServicesTotal), PAGE_WIDTH-MARGIN, current_height, {align: "right"})
    current_height += 6

    doc.setFontSize(8)
    doc.text(`DV No.`,1*MARGIN, current_height)
    doc.text(`Payee`, 2*MARGIN, current_height)
    doc.text(`Gross`, 5*MARGIN, current_height)
    doc.text(`10% Tax`, 6*MARGIN, current_height)
    doc.text(`Net`, 7*MARGIN, current_height)
    doc.text(`Remarks`, 8*MARGIN, current_height)
    doc.setFont("Times", "normal")
    current_height+= 6
    
    for (const entry of reportData) {
        doc.text(`${entry.dv_no || ''}`,1*MARGIN, current_height)
        doc.text(`${entry.payee_name || ''}`, 2*MARGIN, current_height)
        doc.text(`${formatNumber(entry.gross || 0)}`, 5*MARGIN, current_height)
        doc.text(`${formatNumber(entry.amount_taxed || 0)}`, 6*MARGIN, current_height)
        doc.text(`${formatNumber(entry.net_amount || 0)}`, 7*MARGIN, current_height)
        doc.text(`${entry.remarks || ''}`, 8*MARGIN, current_height)

        current_height += 6
    }

    doc.text(`Personnel Services Total`, MARGIN, current_height)
    doc.text(formatNumber(personnelServicesTotal), PAGE_WIDTH-MARGIN, current_height, {align: "right"})
    current_height += 6
    
    const filename = `${project_code}_LiquidationReport_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.pdf`
    
    doc.save(filename);   
}