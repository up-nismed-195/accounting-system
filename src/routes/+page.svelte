<script>
import { generateVoucher } from "./voucherGenerator";


  function handleGenerateVoucher() {
    generateVoucher({
        payee:'1',
        address:'1',
        dv_no:'1',
        mode:'1',
        charge:'1',
        particulars:'1',
        authorized_rep:'1',
        approver:'1',
        amount:1234,
        apply_tax: false,
    });

    console.log("yes")
  }
</script>


<button
class="action-btn generate"
on:click={() => handleGenerateVoucher()}
title="Generate Voucher"
>
Generate Voucher
</button>
