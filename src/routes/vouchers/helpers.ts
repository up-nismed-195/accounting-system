import { generatePDF } from "../voucherGenerator"

function generateRandomString(length: number) {
    let string = ""
    for (let i = 0; i < length; i++) {
    string += String.fromCharCode(97+Math.floor(Math.random() * 26))
    }

    return string
}

export function generateRandomVoucherData(): VoucherEntry{
    return {
        id: crypto.randomUUID(),
        dv_no: "",
        name: "",
        address: "",  
        particulars: "", 
        mode: "", 
        remarks: "",
        amount: 0, 
        tax: 0, 
    }
}

export function padZeroes(targetDigits: number, number: number): string {
    let stringified = number.toString()
    let numberLength = stringified.length
    let zeroesToPad = targetDigits - numberLength
    let padded = "0".repeat(zeroesToPad) + stringified

    return padded
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
        apply_tax: data.tax,
    };

    generatePDF(voucherData);
}