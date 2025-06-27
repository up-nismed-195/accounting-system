import { generatePDF } from "./voucherGenerator"

function generateRandomString(length: number) {
    let string = ""
    for (let i = 0; i < length; i++) {
    string += String.fromCharCode(97+Math.floor(Math.random() * 26))
    }

    return string
}

export function generateRandomVoucherData(): VoucherEntry{
    return {
        dv_no: '1',
        name: `${generateRandomString(25)}`,
        address: `${generateRandomString(30)}`,  
        particulars: `${generateRandomString(25)}`, 
        mode: `${generateRandomString(5)}`, 
        remarks: `${generateRandomString(12)}`,
        amount: Math.round(Math.random() * 50000), 
        tax: Math.round(Math.random() * 5) * 5, 
        
    }
}

export function generateVoucher(data: VoucherPDF) {
    console.log(data)
    const voucherData = {
        payee: data.name,
        address: data.address,
        dv_no: data.dv_no,
        mode: data.mode,
        charge: `projectCodes[${data.project_name}]`,
        particulars: data.particulars,
        authorized_rep: data.authorized_rep,
        approver: data.approver,
        amount: +data.amount, 
        apply_tax: !!data.tax,
    };

    generatePDF(voucherData);
}