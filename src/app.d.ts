// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Project {
		code: string,
		name: string,
		is_active?: boolean,
		gross_total?: number,
		net_total?: number,
		total_payees?: number,
		total_vouchers?: number
		authorized_rep?: string,
		approver?: string,
		tax_value?: string
	}
	
	interface LiquidationEntry {
		project_code: string,
		project_name: string,
		dv_no: string,
		voucher_date: string,
		particulars: string,
		tin_no: string,
		gross: number,
		amount_taxed: number,
		net_amount: number,
		remarks: string,
		payee_name: string
	}

	interface LiquidationSummary {
		project_code: string,
		gross_total: number,
		net_total: number,
		total_payees: number,
		total_vouchers: number,
	}

	interface Payee {
		name: string,
		address: string,
	}

	interface VoucherEntry extends
		Pick<Payee, "name" | "address">
	{	
		id: string,
		dv_no: string,
		particulars: string,
		mode: string,
		remarks: string,
		amount: number,
		tax: number,
	}

	interface VoucherPDF extends Pick<VoucherEntry, 
		"name"  
		|"address"
		| "dv_no" 
		| "particulars" 
		| "mode" 
		| "remarks" 
		| "amount" 
		| "tax"
	> {
		project_name: string,
		date: string,	
		total: number,
		authorized_rep: string,
		approver: string,
	}
}

export {};
