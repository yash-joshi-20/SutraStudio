# 💳 Razorpay Standard Payment Link — Form Fill-Up Cheatsheet
> **આ ફાઇલમાંથી સીધું Copy-Paste કરીને Razorpay ના "Standard Payment Link" ફોર્મમાં ભરી શકો છો.**

---

## 📋 ફોર્મમાં શું અને કેવી રીતે ભરવું (Field-by-Field Copy-Paste)

### ૧. Amount * (રકમ)
* **Currency**: `₹ (INR)` *(પહેલેથી સિલેક્ટ હશે)*
* **Amount**: 
  * ટેસ્ટ કરવા માટે: `10.00` અથવા `100.00`
  * સ્ટાન્ડર્ડ સર્વિસ રીટેઈનર માટે: `49999.00` (અથવા ક્લાયન્ટ પાસેથી જેટલા લેવાના હોય તેટલા)

---

### ૨. Payment For (શેના માટે પેમેન્ટ છે)
* **કોપી કરો**:
  ```text
  SYNAPSE KINETIC — AI Marketing Retainer & Growth Engine
  ```
  *(અથવા કોઈ સ્પેસિફિક સર્વિસ હોય તો: `Autonomous Ad Campaign Deployment`)*

---

### ૩. Customer Details (ગ્રાહકની વિગત)
* **Email**:
  ```text
  yashvistaralabs20@gmail.com
  ```
  *(જો તમે આ લિન્ક કોઈ ચોક્કસ ક્લાયન્ટને ઈમેલ કરવા માંગતા હોવ તો ત્યાં ક્લાયન્ટનો ઈમેલ નાખવો)*
* **Notify via Email Checkbox**: `[✓] ટીક કરો` (Check કરો)
* **Phone Number**:
  ```text
  +91 [તમારો 10-અંકનો મોબાઈલ નંબર]
  ```
* **Notify via SMS Checkbox**: `[✓] ટીક કરો` (Check કરો જો SMS મોકલવો હોય)

---

### ૪. Reference Id (ઓર્ડર અથવા ઇનવોઇસ રેફરન્સ)
* **કોપી કરો**:
  ```text
  ORD-SYNAPSE-2026-01
  ```

---

### ૫. Link Expiry (લિન્કની સમય મર્યાદા)
* **No Expiry Checkbox**: `[✓] ટીક કરો (Checkmark કરો)`
  > **મહત્વનું**: `No Expiry` ટીક રાખશો એટલે આ લિન્ક ક્યારેય એક્સપાયર (બંધ) નહીં થાય અને ગમે ત્યારે વાપરી શકાશે.

---

### ૬. Partial Payment (અડધા પૈસા લેવા)
* **Enable Partial Payment Checkbox**: `[ ] ખાલી રાખો (Unchecked રાખો)`
  *(જેથી ક્લાયન્ટ પૂરી રકમ જ ભરે)*

---

### ૭. Notes (+ Add New) — (આંતરિક રેકોર્ડ માટે)
જો `+ Add New` પર ક્લિક કરો તો આ બે નોટ્સ ઉમેરી શકો છો:
* **Note 1**:
  * Title: `Agency`
  * Value: `Synapse Kinetic AI`
* **Note 2**:
  * Title: `Support`
  * Value: `yashvistaralabs20@gmail.com`

---

## 🏦 બેંક ખાતાની વિગત (Bank Details) ક્યાં ભરવી?

> ⚠️ **ધ્યાન રાખો**: 
> તમે જે સ્ક્રીનશોટ મોકલ્યો છે તે **Payment Link જનરેટ કરવાનું ફોર્મ** છે. આ ફોર્મમાં તમારે બેંક ખાતા નંબર કે IFSC કોડ **નથી** ભરવાનો હોતો.

### બેંક એકાઉન્ટ ક્યાં એડ કરવું?
Razorpay માં ક્લાયન્ટ પાસેથી મળેલા પૈસા તમારા બેંક ખાતામાં જમા (Payout/Settlement) થાય તે માટે:
1. Razorpay Dashboard ના ડાબી બાજુના મેનૂમાં **Settings (સેટિંગ્સ)** પર જાઓ.
2. ત્યાં **Bank Account** અથવા **Settlements** ટેબ પર ક્લિક કરો.
3. ત્યાં તમારા બેંક ખાતાની વિગત ભરો:
   * **Account Holder Name** (ખાતાધારકનું પૂરું નામ): `Yash Joshi`
   * **Account Number** (બેંક ખાતા નંબર)
   * **Confirm Account Number**
   * **IFSC Code** (બેંક શાખાનો IFSC કોડ)
4. સેવ કરો. Razorpay તમારા ખાતામાં ₹1 જમા કરીને વેરીફાઈ કરશે.
5. આ સેટિંગ થયા પછી, તમે જેટલી પણ Payment Links બનાવશો તેના બધા પૈસા સીધા તમારા તે બેંક એકાઉન્ટમાં આવશે!

---

## 🚀 ફોર્મ સબમિટ કર્યા પછી:
* નીચે **"Create Payment Link"** બટન પર ક્લિક કરો.
* Razorpay તમને એક યુનિક લિન્ક આપશે (દા.ત. `https://rzp.io/l/...`).
* એ લિન્ક તમે કોઈપણ ક્લાયન્ટને WhatsApp, Email કે Dashboard પર આપી શકો છો!
