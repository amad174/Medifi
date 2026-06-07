/* Three realistic (but fake) NHS-style letters and Medifi's parsed output.
 * No real patient data. Used by the Medifi app UI kit demo. */

/* Demo venue directory — in production this would come from NHS / TfL APIs. */
window.MEDIFI_VENUES = {
  "st-thomas": {
    id: "st-thomas",
    name: "St Thomas' Hospital",
    unit: "Clinic B, 2nd Floor",
    address: "Westminster Bridge Rd, London SE1 7EH",
    postcode: "SE1 7EH",
    lat: 51.4988,
    lng: -0.1189,
    arrivalNote: "Allow a few extra minutes to find Clinic B on the 2nd floor.",
    mapsQuery: "St Thomas' Hospital, Westminster Bridge Rd, London SE1 7EH",
    routes: [
      {
        id: "bus",
        mode: "bus",
        label: "Bus",
        summary: "Routes 12, 148, 159, 453",
        duration: "25–35 min",
        detail: "Get off at Lambeth Palace Rd. The main hospital entrance is a 3-minute walk.",
        leaveByOffsetMins: 50,
      },
      {
        id: "tube",
        mode: "tube",
        label: "Tube",
        summary: "Westminster · Jubilee line",
        duration: "20–30 min",
        detail: "Exit for Westminster Bridge, then walk 8 minutes south across the bridge.",
        leaveByOffsetMins: 45,
      },
      {
        id: "car",
        mode: "car",
        label: "Driving",
        summary: "Hospital car park · pay on exit",
        duration: "varies",
        detail: "Use St Thomas' Street car park. Spaces fill up on clinic days — arrive early.",
        leaveByOffsetMins: 55,
      },
    ],
  },
  "city-hospital": {
    id: "city-hospital",
    name: "City Hospital",
    unit: "Endoscopy Unit",
    address: "Oldham Rd, Manchester M4 4FE",
    postcode: "M4 4FE",
    lat: 53.4889,
    lng: -2.2197,
    estimated: true,
    arrivalNote: "Your letter didn't include a full address — we've matched the hospital name. Always confirm the unit when you call.",
    mapsQuery: "City Hospital Manchester Endoscopy Unit",
    routes: [
      {
        id: "tram",
        mode: "tram",
        label: "Tram",
        summary: "Piccadilly–Etihad line · Holt Town",
        duration: "20–30 min",
        detail: "Walk 6 minutes from Holt Town stop. Follow signs to the main entrance, then ask for Endoscopy.",
        leaveByOffsetMins: 50,
      },
      {
        id: "bus",
        mode: "bus",
        label: "Bus",
        summary: "Routes 53, 135, 231",
        duration: "30–40 min",
        detail: "Get off at City Hospital stop on Oldham Rd. The Endoscopy Unit is inside the main building.",
        leaveByOffsetMins: 55,
      },
      {
        id: "car",
        mode: "car",
        label: "Driving",
        summary: "Drop-off at main entrance",
        duration: "varies",
        detail: "Someone must collect you after the procedure — you cannot drive yourself home.",
        leaveByOffsetMins: 50,
      },
    ],
  },
  "boots-high-street": {
    id: "boots-high-street",
    name: "Boots Pharmacy",
    unit: "High Street",
    address: "42 High Street, London E1 6AN",
    postcode: "E1 6AN",
    lat: 51.5155,
    lng: -0.061,
    arrivalNote: "Bring photo ID if someone else is collecting for you.",
    mapsQuery: "Boots Pharmacy High Street London E1 6AN",
    routes: [
      {
        id: "walk",
        mode: "walk",
        label: "Walking",
        summary: "From most of E1",
        duration: "5–15 min",
        detail: "A short walk if you're nearby. Check opening hours before you set off.",
        leaveByOffsetMins: 15,
      },
      {
        id: "bus",
        mode: "bus",
        label: "Bus",
        summary: "Routes 25, 205, D3",
        duration: "10–20 min",
        detail: "Get off at the High Street stop — the pharmacy is on the corner.",
        leaveByOffsetMins: 20,
      },
    ],
  },
};

window.MEDIFI_LETTERS = [
  {
    id: "derm",
    venueId: "st-thomas",
    event: { title: "Dermatology appointment — St Thomas'", y: 2026, mo: 6, d: 12, h: 10, min: 30, durMins: 30, location: "St Thomas' Hospital, Clinic B" },
    chip: "Appointment letter",
    sender: "St Thomas' Hospital · Dermatology",
    received: "Received 2 days ago",
    worstLevel: "caution",
    original:
`Dear Ms Khan,

NHS number: 485 777 3456

You are invited to attend the Dermatology Outpatient
Department for a review appointment.

Date: Tuesday 12 June 2026 at 10:30
Venue: St Thomas' Hospital, Clinic B, 2nd Floor

Please arrive 15 minutes before your appointment and
bring a list of your current medications. Failure to
attend may result in discharge back to your GP.

Appointments line: 020 7188 7188`,
    headline: "Skin (dermatology) appointment",
    when: "Tuesday 12 June, 10:30am",
    summary:
      "You have a skin (dermatology) check-up appointment. Arrive 15 minutes early and bring a list of the medicines you take. If you can't go, call the appointments line so you don't lose your place.",
    fields: [
      { label: "Appointment", value: "Dermatology review" },
      { label: "Date & time", value: "Tue 12 Jun 2026, 10:30am" },
      { label: "Location", value: "St Thomas', Clinic B, 2nd flr" },
      { label: "What to bring", value: "List of your medicines" },
      { label: "Phone", value: "020 7188 7188" },
    ],
    checklist: [
      { id: "cal", label: "Add to your calendar", meta: "Tue 12 Jun, 10:30am", icon: "calendar" },
      { id: "route", label: "Plan your route to the hospital", meta: "Tube · ~25 min", icon: "pin", action: "routes" },
      { id: "meds", label: "Write a list of your medicines", icon: "list" },
      { id: "early", label: "Plan to arrive 15 minutes early", meta: "By 10:15am", icon: "clock" },
      { id: "id", label: "Bring photo ID and your NHS number", icon: "id" },
    ],
    risks: [
      { level: "caution", title: "No cancellation deadline given",
        text: "The letter doesn't say how much notice to give if you can't attend. Call the appointments line as soon as you know." },
      { level: "safe", title: "Date, place and phone number all found",
        text: "The key details are all present in this letter." },
    ],
  },
  {
    id: "referral",
    event: { title: "Chase cardiology referral", y: 2026, mo: 8, d: 30, h: 9, min: 0, durMins: 15, location: "", chase: true },
    chip: "Referral letter",
    sender: "GP Surgery · Cardiology referral",
    received: "Received 5 days ago",
    worstLevel: "caution",
    original:
`Dear Patient,

We have referred you to the Cardiology service following
your recent appointment. You are now on the waiting list.

The hospital will contact you directly with an appointment
date. Waiting times are currently 14–18 weeks.

If your symptoms get worse while you wait, contact your GP
or call 111.`,
    headline: "Heart (cardiology) referral",
    when: "Waiting for a date",
    summary:
      "Your GP has asked the heart (cardiology) team to see you. You're now on their waiting list. The hospital — not your GP — will write to you with a date. This can take around 14 to 18 weeks.",
    fields: [
      { label: "Referred to", value: "Cardiology service" },
      { label: "Status", value: "On the waiting list" },
      { label: "Expected wait", value: "14–18 weeks" },
      { label: "Who contacts you", value: "The hospital" },
      { label: "Appointment date", missing: true },
      { label: "Phone", missing: true },
    ],
    checklist: [
      { id: "wait", label: "Note that the hospital will contact you", meta: "Not your GP", icon: "info" },
      { id: "diary", label: "Set a reminder to chase if nothing arrives", meta: "In about 12 weeks", icon: "clock" },
      { id: "worse", label: "Save 111 in case symptoms get worse", icon: "phone" },
    ],
    risks: [
      { level: "caution", title: "No phone number to chase your referral",
        text: "If you hear nothing in 12–14 weeks, the letter doesn't say who to call. Contact your GP surgery and ask for the cardiology booking line." },
      { level: "caution", title: "No appointment date yet",
        text: "This is normal for a referral — but keep this letter so you can prove when you were referred." },
    ],
  },
  {
    id: "badadmin",
    venueId: "city-hospital",
    event: { title: "Endoscopy — City Hospital", y: 2026, mo: 6, d: 2, h: 9, min: 0, durMins: 60, location: "City Hospital, Endoscopy Unit" },
    chip: "Confusing letter",
    sender: "City Hospital · Endoscopy unit",
    received: "Received today",
    worstLevel: "risk",
    original:
`Dear Mr Patient,

Your appointment for an endoscopy is confirmed.

Date: 2 June 2026, 9:00am
Location: Endoscopy Unit

Please do not eat for several hours before your
procedure. Someone must collect you afterwards.

We look forward to seeing you.`,
    headline: "Camera test (endoscopy)",
    when: "Date may have passed",
    summary:
      "This letter is about a camera test of your stomach (endoscopy). Some important details look wrong or missing, so please read the warnings below before you do anything else.",
    fields: [
      { label: "Procedure", value: "Endoscopy" },
      { label: "Date & time", value: "2 Jun 2026, 9:00am" },
      { label: "Location", value: "Endoscopy Unit (no address)" },
      { label: "Fasting", value: "\"several hours\" — unclear" },
      { label: "Phone", missing: true },
    ],
    checklist: [
      { id: "check", label: "Check the date against today", meta: "It may have passed", icon: "alert" },
      { id: "route", label: "Plan your route to the hospital", meta: "Address not in letter", icon: "pin", action: "routes" },
      { id: "transport", label: "Arrange someone to collect you", icon: "id" },
      { id: "gp", label: "Call your GP to confirm this is still booked", icon: "phone" },
    ],
    risks: [
      { level: "risk", title: "This date may have already passed",
        text: "The letter says 2 June 2026, which is before today. Don't assume it's cancelled — call the hospital or your GP to check before you miss care." },
      { level: "risk", title: "No phone number on the letter",
        text: "There's no number to call to confirm or rebook. Look up 'City Hospital endoscopy' or ask your GP surgery for the unit's direct line." },
      { level: "caution", title: "Fasting time is vague",
        text: "It says 'do not eat for several hours' but not exactly how long. Ask when you call — fasting too little can mean your test is cancelled on the day." },
    ],
  },
  {
    id: "rx",
    venueId: "boots-high-street",
    chip: "Prescription",
    sender: "GP Surgery · Repeat prescription",
    received: "Received 1 hour ago",
    worstLevel: "caution",
    medicines: [
      { name: "Amoxicillin 500mg", dose: "1 capsule", times: ["08:00", "14:00", "20:00"], days: 7, note: "3 times a day, finish the course" },
      { name: "Ibuprofen 400mg", dose: "1 tablet", times: ["08:00", "20:00"], days: 5, note: "twice a day, with food" },
    ],
    original:
`PRESCRIPTION

Patient: Ms A Khan    NHS number: 485 777 3456

1. Amoxicillin 500mg capsules
   Take ONE capsule THREE times a day for 7 days.

2. Ibuprofen 400mg tablets
   Take ONE tablet TWICE a day with food for 5 days.

Collect from: Boots Pharmacy, High Street.
Speak to your pharmacist if you have questions.`,
    headline: "Your prescription",
    when: "Start today",
    summary:
      "You have two medicines to take. Amoxicillin is an antibiotic — take it 3 times a day and finish the whole course, even if you feel better. Ibuprofen is for pain — take it twice a day with food.",
    fields: [
      { label: "Medicine 1", value: "Amoxicillin 500mg" },
      { label: "How often", value: "3x a day · 7 days" },
      { label: "Medicine 2", value: "Ibuprofen 400mg" },
      { label: "How often", value: "2x a day, with food · 5 days" },
      { label: "Collect from", value: "Boots, High Street" },
    ],
    checklist: [
      { id: "collect", label: "Collect your medicines from the pharmacy", meta: "Boots, High Street", icon: "pin" },
      { id: "route", label: "Plan your route to the pharmacy", meta: "Walking · ~10 min", icon: "pin", action: "routes" },
      { id: "remind", label: "Set medicine reminders on your calendar", icon: "calendar" },
      { id: "food", label: "Take ibuprofen with food", icon: "info" },
      { id: "finish", label: "Finish the whole antibiotic course", meta: "All 7 days", icon: "check" },
    ],
    risks: [
      { level: "caution", title: "Finish the whole antibiotic course",
        text: "Keep taking Amoxicillin for all 7 days even if you feel better, or the infection can come back. Ask your pharmacist if you're unsure." },
      { level: "safe", title: "Doses and timings are clear",
        text: "Both medicines have a clear amount and how often to take them." },
    ],
  },
];
