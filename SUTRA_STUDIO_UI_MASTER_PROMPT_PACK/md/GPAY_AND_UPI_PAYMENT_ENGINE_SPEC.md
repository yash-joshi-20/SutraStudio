# GPay & Dynamic UPI Payment Engine Specification (ઝીરો-કમિશન GPay / UPI પેમેન્ટ એન્જિન)

**Document Code**: `DOC-AI-03-PAYMENT-GPAY`  
**Purpose**: ગેટવે કમિશન (Razorpay/Stripe ની 2-3% ફી) વગર સીધા મર્ચન્ટના બેંક ખાતામાં Dynamic UPI QR અને GPay Deep-Link દ્વારા 100% ફંડ મેળવવાની ટેકનિકલ સિસ્ટમ.

---

## 1. પેમેન્ટ એન્જિન ફ્લો (Payment Architecture Flow)

```
[ ક્લાયન્ટ ચેકઆઉટ / પેકેજ સિલેક્ટ કરે છે ]
                     │
                     ▼
  [ Dynamic UPI QR Generator (UpiQrPaymentModal.tsx) ]
  • UPI URI: upi://pay?pa=yashj9428-1@oksbi&pn=SYNAPSE%20KINETIC&am=4999&cu=INR&tn=Order-8392
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[ મોબાઇલ યુઝર: 1-Click GPay ]    [ ડેસ્કટોપ યુઝર: QR સ્કેન ]
(ઓટોમેટિક GPay / PhonePe એપ ઓપન)  (મોબાઇલ કેમેરા / GPay થી સ્કેન)
                     │                           │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
          [ ક્લાયન્ટ ૧૨-અંકનો બેંક UTR / Ref No દાખલ કરે છે ]
                                   │
                                   ▼
             [ Next.js API: /api/payments/verify ]
                                   │
       ┌───────────────────────────┴───────────────────────────┐
       ▼                                                       ▼
[ Supabase માં પેમેન્ટ સ્ટેટસ = 'verified' ]     [ Local n8n ને વેબહુક ટ્રિગર ]
```

---

## 2. વપરાતા AI ટૂલ્સ અને ટેકનોલોજી ઘટકો

| ઘટક | ટેકનોલોજી | વિગતવાર કામગીરી |
| :--- | :--- | :--- |
| **Dynamic QR Engine** | **`qrcode.react` / SVG Matrix** | પેકેજ અમાઉન્ટ અને ઓર્ડર ID સાથે લાઈવ સ્કેનેબલ ક્યુઆર કોડ જનરેટ કરે છે. |
| **Mobile Deep-Link Intent** | **`upi://pay` Standard Protocol** | મોબાઇલમાં સીધા GPay, PhonePe, Paytm, BHIM એપ્સ ૧-ક્લિકમાં ઓપન કરે છે. |
| **UTR Verification Engine** | **Regex + Banking Format Validator** | ૧૨ આંકડાના યુનિક ટ્રાન્ઝેક્શન રેફરન્સ (UTR) ની પ્રામાણિકતા તપાસે છે. |
| **OCR UTR Verification** | **Tesseract.js / Gemini Vision** | ક્લાયન્ટે અપલોડ કરેલા પેમેન્ટ સ્ક્રીનશોટમાંથી UTR નંબર આપોઆપ વાંચે છે. |
| **Ledger Reconciliation** | **PostgreSQL Payment Ledger** | ડુપ્લિકેટ UTR અટકાવે છે અને રિયલ-ટાઇમ ઓર્ડર સ્ટેટસ અનલોક કરે છે. |

---

## 3. વેપાર માટે ફાયદા (Business Impact)

1. **૦% પેમેન્ટ ગેટવે ચાર્જ**: દર મહિને ₹૧,૦૦,૦૦૦ ના ટર્નઓવર પર ₹૩,૦૦૦ સુધીનો ગેટવે કમિશન ખર્ચ બચે છે.
2. **ઇન્સ્ટન્ટ સેટલમેન્ટ (T+0)**: પૈસા સીધા તમારા બેંક એકાઉન્ટ (SBI / HDFC / ICICI) માં જમા થાય છે, કોઈ ૩ દિવસની રાહ જોવી પડતી નથી.
3. **ઓટોમેટેડ ઓર્ડર અનલોક**: UTR સબમિટ થતાં જ AI પ્રોડક્શન પાઈપલાઈન શરૂ થઈ જાય છે.
