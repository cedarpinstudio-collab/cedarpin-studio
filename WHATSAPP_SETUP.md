# CedarPin Sourcing — WhatsApp Cloud API

This integration belongs only to CedarPin Sourcing. Do not connect Mbarak Motorcycle Garage accounts, contacts, domains, files, or customer data.

## Vercel environment variables

Set these in the CedarPin Sourcing Vercel project for Production, Preview, and Development as appropriate:

- `WHATSAPP_VERIFY_TOKEN`: create a long random value yourself; enter the same value in Meta.
- `WHATSAPP_APP_SECRET`: Meta App Dashboard > App settings > Basic.
- `WHATSAPP_ACCESS_TOKEN`: keep server-side only; not used by the receive-only phase.
- `WHATSAPP_PHONE_NUMBER_ID`: the Cloud API phone-number ID; not the public phone number.

Never paste these values into source code, chat, screenshots, or client-side JavaScript.

## Meta webhook setup

1. Deploy the project on Vercel.
2. In Meta Developers > WhatsApp > Configuration, set Callback URL to:
   `https://YOUR-VERCEL-DOMAIN/api/whatsapp`
3. Set Verify token to exactly the value stored as `WHATSAPP_VERIFY_TOKEN` in Vercel.
4. Click Verify and Save.
5. Subscribe to the `messages` webhook field.
6. Send one test message and confirm a successful 200 response in Vercel logs.

## Safety status

- Webhook verification: enabled.
- POST signature verification: required when receiving events.
- Israel restriction: incoming +972 senders and explicit Israel references are ignored.
- Privacy: message bodies and complete phone numbers are not logged.
- Automated replies: disabled.
- Bulk outreach: disabled.
- Voice notes and calls: disabled.
- Mbarak Motorcycle Garage data: prohibited and separate.

Before enabling replies, add verified consent, opt-out handling, approved templates for business-initiated conversations, human escalation, durable lead storage, and tests.
