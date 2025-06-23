// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Voucher {
			payee: string,
			address: string,
			dv_no: string,
			particulars: string,
			mode_of_payment: string,
			tin_id_no: string,
			remarks: string,
			date: string,
			amount: number,
			less_tax: number,
			project: string,
			authorized_rep: string,
			approver: string, 
		}

		interface VoucherUI extends Pick<Voucher, 
			"payee" |
			"address" | 
			"project" | 
			"particulars" | 
			"mode_of_payment" | 
			"remarks" | 
			"amount" | 
			"less_tax"
		> {}
	}
}

export {};
