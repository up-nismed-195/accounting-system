import { writable } from "svelte/store";

const STORAGE_KEY = 'vouchers_table_data';

function getDefault() {
    return {
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
    };
}

function load() {
    if (typeof localStorage !== "undefined") {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
    }
    return getDefault();
}

export const table_data = writable(load());

// Only subscribe to localStorage in the browser
if (typeof window !== "undefined") {
    table_data.subscribe(value => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
}