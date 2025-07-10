// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {

	// tables
	interface cash_advance {
		id?: number,
		project_code: string,
		date_requested: string,
		date_received?: string,
		received_from?: string,
		cash_amount: number,
	}

	interface liquidation_group {
		id?: number,
		project_code: string,
		misc_particular: string,
		has_tax_deduction: boolean,
		gross: number
	}

	interface payee {
		name: string,
		id?: number,
		address?: string,
		tin_id?: string,
	}
	
	interface project {
		code: string,
		id?: number,
		title: string,
		tax: number,	
		authorized_rep: string,
		approver: string,
		admin_officer: string,
	}

	interface voucher {
		dv_no: string,
		id?: number,
		payee_name: string,
		project_code: string,
		date: string,
		nth_yearly_voucher: number,
		gross: number,
		has_tax_deduction: boolean,
		particulars: string,
		payment_mode: string,
		remarks?: string,
	}

	// summaries
	interface summary {
		code: string,
		title: string,
		total_vouchers: number,
		gross_total: number,
		net_total: number,
		project_id?: number
	}
}

export {};
