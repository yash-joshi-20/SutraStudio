# SUTRA STUDIO — API & INTEGRATIONS AUDIT REPORT (QA-7 FINAL)

Please see the full report located at [QA/API_STATUS_REPORT.md](file:///d:/SutraStudio/QA/API_STATUS_REPORT.md).

### Quick Owner Action Summary:
1. **Firebase Admin SDK (`FIREBASE_PRIVATE_KEY`)**: Generate from Firebase Console → Project settings → Service accounts.
2. **Google Drive 5 TB Vault (`GOOGLE_DRIVE_REFRESH_TOKEN`)**: Run `npx tsx scripts/get-drive-refresh-token.ts` with your Drive owner account.
3. **Razorpay Payments (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)**: Add keys from Razorpay Dashboard (Test mode for testing, Live mode for production).
4. **Google AI Gemini (`GEMINI_API_KEY`)**: Free key from Google AI Studio (`aistudio.google.com`).
5. **Zoho Mail SMTP (`SMTP_APP_PASSWORD`)**: App-specific password from Zoho Mail Security settings.
