import os
import json
import datetime
from tkinter import *
from tkinter import messagebox, ttk
from fpdf import FPDF
from num2words import num2words

# === Constants ===
TRACKER_FILE = "dv_tracker.json"
OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === DV Number Functions ===
def load_next_dv(year):
    if os.path.exists(TRACKER_FILE):
        with open(TRACKER_FILE, "r") as f:
            tracker = json.load(f)
    else:
        tracker = {}
    if str(year) not in tracker:
        tracker[str(year)] = 0
    tracker[str(year)] += 1
    with open(TRACKER_FILE, "w") as f:
        json.dump(tracker, f, indent=2)
    return f"SO-{str(year)[-2:]}-{tracker[str(year)]}"

def manual_dv_override(year, number):
    if os.path.exists(TRACKER_FILE):
        with open(TRACKER_FILE, "r") as f:
            tracker = json.load(f)
    else:
        tracker = {}
    tracker[str(year)] = number
    with open(TRACKER_FILE, "w") as f:
        json.dump(tracker, f, indent=2)

# === PDF Generator ===
class VoucherPDF(FPDF):
    def header(self):
        self.set_font("Times", "B", 12)
        self.cell(0, 10, "Foundation for the Promotion of Science and Mathematics Education and Research, Inc.", ln=True, align="C")
        self.set_font("Times", "B", 12)
        self.cell(0, 8, "DISBURSEMENT VOUCHER", ln=True, align="C")
        self.ln(3)

    def add_voucher_details(self, data):
        self.rect(10, 10, 190, 240)
        
        self.set_font("Times", "", 10)
        self.cell(20, 8, "Payee:", border=1)
        self.set_font("Times", "B", 10)
        self.cell(105, 8, data["payee"], border=1)
        self.set_font("Times", "", 10)
        self.cell(30, 8, "DV No.", border=1)
        self.cell(0, 8, data["dv_no"], border=1, ln=True)

        self.cell(20, 8, "Address:", border=1)
        self.set_font("Times", "", 9)
        self.cell(105, 8, data["address"], border=1)
        self.set_font("Times", "", 10)
        self.cell(30, 8, "Date:", border=1)
        self.cell(0, 8, data["date"], border=1, ln=True)

        self.cell(20, 8, "Charge vs:", border=1)
        self.set_font("Times", "B", 9)
        self.cell(0, 8, data["charge_vs"], border=1, ln=True)

        self.set_font("Times", "", 10)
        self.cell(30, 8, "Mode of Payment:", border=1)
        self.cell(0, 8, data["mode_of_payment"], border=1, ln=True)

        self.set_font("Times", "B", 10)
        self.cell(120, 8, "Particulars", border=1, align="C")
        self.cell(0, 8, "Amount", border=1, ln=True, align="C")

        self.set_font("Times", "", 10)
        self.cell(120, 12, data["particulars"], border=1, align="L")
        self.cell(0, 12, f"PHP {data['amount']:,.2f}".replace(",", " ").replace(".", ","), border=1, ln=True, align="R")

        tax = data["amount"] * 0.10 if data.get("apply_tax", True) else 0
        total = data["amount"] - tax

        if data.get("apply_tax", True):
            self.cell(120, 12, "Less 10% Tax", border=1, align="R")
            self.cell(0, 12, f"PHP {tax:,.2f}".replace(",", " ").replace(".", ","), border=1, ln=True, align="R")

        self.set_font("Times", "B", 10)
        self.cell(120, 12, "Total", border=1, align="R")
        self.cell(0, 12, f"PHP {total:,.2f}".replace(",", " ").replace(".", ","), border=1, ln=True, align="R")

        current_y = self.get_y()
        self.rect(10, current_y, 95, 50)
        self.rect(105, current_y, 95, 50)

        self.set_xy(12, current_y + 2)
        self.set_font("Times", "B", 10)
        self.cell(10, 6, "A", border=0)
        self.set_xy(12, current_y + 8)
        self.set_font("Times", "", 9)
        self.multi_cell(90, 4, "Certified: Expenses/cash advance necessary, lawful, and incurred under my direct supervision")

        self.set_xy(107, current_y + 2)
        self.set_font("Times", "B", 10)
        self.cell(10, 6, "B", border=0)
        self.set_xy(107, current_y + 8)
        self.set_font("Times", "", 9)
        self.multi_cell(90, 4, "Approved for payment by:")

        self.set_xy(12, current_y + 26)
        self.set_font("Times", "BU", 10)
        self.cell(90, 8, data["authorized_rep"], border=0, align="C")

        self.set_xy(105, current_y + 26)
        self.cell(95, 8, data["approver"], border=0, align="C")

        self.set_xy(12, current_y + 34)
        self.set_font("Times", "", 9)
        self.cell(90, 5, "Signature over Printed Name", border=0, align="C")
        self.set_xy(105, current_y + 34)
        self.cell(95, 5, "Signature over Printed Name", border=0, align="C")

        self.set_xy(12, current_y + 39)
        self.cell(90, 5, "of Authorized Representative", border=0, align="C")
        self.set_xy(105, current_y + 39)
        self.cell(95, 5, "Executive Director, FPSMER, Inc.", border=0, align="C")

        self.set_xy(12, current_y + 44)
        self.cell(90, 5, f"Date: {data['date']}", border=0, align="C")
        self.set_xy(105, current_y + 44)
        self.cell(95, 5, f"Date: {data['date']}", border=0, align="C")

        current_y = self.get_y() + 5

        self.set_xy(12, current_y + 2)
        self.set_font("Times", "B", 10)
        self.cell(10, 6, "C", border=0)

        cents = int((total % 1) * 100)
        amount_in_words = f"{num2words(int(total), lang='en').title()} Pesos" + ("" if cents == 0 else f" and {num2words(cents, lang='en').title()} Centavos")

        self.set_xy(12, current_y + 8)
        self.set_font("Times", "", 10)
        self.multi_cell(185, 5, f"Received from the Foundation for the Promotion of Science and Mathematics Education and Research, Inc. the amount of {amount_in_words}", border=0)

        self.set_xy(120, current_y + 25)
        self.set_font("Times", "BU", 12)
        self.cell(60, 8, f"PHP {total:,.2f}".replace(",", " ").replace(".", ","), ln=True, align="C")
        
        self.set_xy(120, current_y + 55)  
        self.set_font("Times", "BU", 12) 
        self.cell(60, 8, data["payee"], ln=True, align="C")  

        self.set_xy(120, current_y + 62) 
        self.set_font("Times", "", 8)
        self.cell(60, 4, "Signature over Printed Name", ln=True, align="C")

        self.set_xy(120, current_y + 65)  
        self.cell(60, 4, "of Payee", ln=True, align="C")

        self.set_xy(120, current_y + 68) 
        self.cell(60, 4, f"Date: {data['date']}", ln=True, align="C")

# === GUI App ===
def generate_voucher():
    year = datetime.datetime.now().year
    try:
        amount = float(entry_amount.get())
    except ValueError:

        
        messagebox.showerror("Invalid input", "Amount must be a number.")
        return

    dv_no = entry_dv.get().strip()
    if dv_no == "":
        dv_no = load_next_dv(year)

    today = datetime.date.today().strftime("%d-%b-%y")

    data = {
        "payee": entry_payee.get(),
        "address": entry_address.get(),
        "dv_no": dv_no,
        "mode_of_payment": combo_mode.get(),
        "charge_vs": entry_charge.get(),
        "particulars": txt_particulars.get("1.0", END).strip(),
        "authorized_rep": entry_auth.get(),
        "approver": entry_approver.get(),
        "amount": amount,
        "date": today,
        "apply_tax": var_tax.get()
    }

    pdf = VoucherPDF()
    pdf.add_page()
    pdf.add_voucher_details(data)

    filename = f"{OUTPUT_DIR}/voucher_{dv_no.replace('/', '-')}.pdf"
    pdf.output(filename)
    messagebox.showinfo("Success", f"PDF generated:\n{filename}")

# === Build GUI ===
root = Tk()
root.title("Voucher Generator")
root.geometry("500x480")

for i in range(11):
    root.grid_rowconfigure(i, pad=5)

Label(root, text="Payee").grid(row=0, column=0, sticky=W, padx=5)
entry_payee = Entry(root, width=40)
entry_payee.grid(row=0, column=1, columnspan=2, padx=5)

Label(root, text="Address").grid(row=1, column=0, sticky=W, padx=5)
entry_address = Entry(root, width=40)
entry_address.grid(row=1, column=1, columnspan=2, padx=5)

Label(root, text="DV No. (leave blank for auto)").grid(row=2, column=0, sticky=W, padx=5)
entry_dv = Entry(root, width=20)
entry_dv.grid(row=2, column=1, padx=5)

Label(root, text="Mode of Payment").grid(row=3, column=0, sticky=W, padx=5)
combo_mode = ttk.Combobox(root, values=["Cash", "Check", "Bank Transfer"])
combo_mode.grid(row=3, column=1, padx=5)
combo_mode.current(0)

Label(root, text="Charge vs.").grid(row=4, column=0, sticky=W, padx=5)
entry_charge = Entry(root, width=40)
entry_charge.grid(row=4, column=1, columnspan=2, padx=5)

Label(root, text="Particulars").grid(row=5, column=0, sticky=NW, padx=5)
txt_particulars = Text(root, width=40, height=4)
txt_particulars.grid(row=5, column=1, columnspan=2, padx=5)

Label(root, text="Authorized Rep").grid(row=6, column=0, sticky=W, padx=5)
entry_auth = Entry(root, width=40)
entry_auth.grid(row=6, column=1, columnspan=2, padx=5)

Label(root, text="Approver").grid(row=7, column=0, sticky=W, padx=5)
entry_approver = Entry(root, width=40)
entry_approver.grid(row=7, column=1, columnspan=2, padx=5)

Label(root, text="Amount (PHP)").grid(row=8, column=0, sticky=W, padx=5)
entry_amount = Entry(root, width=20)
entry_amount.grid(row=8, column=1, padx=5)

var_tax = BooleanVar()
var_tax.set(True)
chk_tax = Checkbutton(root, text="Apply Less 10% Tax", variable=var_tax)
chk_tax.grid(row=9, column=0, columnspan=2, sticky=W, padx=5)

Button(root, text="Generate Voucher PDF", command=generate_voucher, 
       bg="green", fg="white", font=("Arial", 10, "bold")).grid(row=10, column=0, columnspan=3, pady=15)

root.mainloop()
