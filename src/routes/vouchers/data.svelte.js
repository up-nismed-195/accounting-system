import { writable } from "svelte/store";

export const table_data = writable({
    rows: [{
        "Project": '1',
        "Date": '2', 
        "No.": '3', 
        "Payee": '4', 
        "Amount": '5',
        "Mode": '6',   
        "Particulars": '7', 
        "Gross": "8",
        "Remarks": '9', 
        "Address": '10',
        "Authorized Rep": '11',
        "Approver": '12',
        "Apply Tax": false,
    }]
})