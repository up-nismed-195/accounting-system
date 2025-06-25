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
		created_at?: string,
		updated_at?: string,
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
}

export {};
