import { writable } from "svelte/store";

export const table_data = writable({
    rows: [{
        "Project": 1,
        "Date": 1, 
        "DV No.": 1, 
        "Payee": 1, 
        "Amount": 1,      
        "Particular": 1, 
        "Gross": 1, 
        "Remarks": 1, 
        "Address": 1,
    }]
})