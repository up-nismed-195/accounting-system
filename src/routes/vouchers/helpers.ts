import { generatePDF } from "./voucherGenerator"

function generateRandomString(length: number) {
    let string = ""
    for (let i = 0; i < length; i++) {
    string += String.fromCharCode(97+Math.floor(Math.random() * 26))
    }

    return string
}

export function generateRandomVoucherData(): App.VoucherUI {
    return {
        payee: `${generateRandomString(25)}`,
        address: `${generateRandomString(30)}`, 
        // project: "NISMED", 
        particulars: `${generateRandomString(25)}`, 
        mode_of_payment: `${generateRandomString(5)}`, 
        remarks: `${generateRandomString(12)}`,
        gross: Math.round(Math.random() * 50000), 
        less_tax: Math.round(Math.random() * 5) * 5, 
    }
}

// "payee" |
// "address" | 
// "project" | 
// "particulars" | 
// "mode_of_payment" | 
// "remarks" | 
// "gross" | 
// "less_tax" |
// "authorized_rep" |
// "approver"

export function generateVoucher(data: App.VoucherPDF, dv: string) {
    console.log(data)
    const voucherData = {
        payee: data.payee,
        address: data.address,
        dv_no: dv,
        mode: data.mode_of_payment,
        charge: `projectCodes[${data.project}]`,
        particulars: data.particulars,
        authorized_rep: data.authorized_rep,
        approver: data.approver,
        amount: +data.gross, // `+` turns string to int
        apply_tax: !!data.less_tax,
    };

    generatePDF(voucherData);
}