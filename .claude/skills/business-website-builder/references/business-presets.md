# Business presets

Pick the closest preset, then adapt. Each preset changes data and wording, not the architecture. "Unit" is what one booking reserves; it drives the booking form, calendar and chatbot.

| Preset | Booking unit | Calendar model | Chatbot asks (after service) | Service categories (examples) | Extra pages / modules | Before/after? | Photo themes |
|---|---|---|---|---|---|---|---|
| **Cleaning** (template) | Job at an address | 4 time windows per day, `slotCapacity` crews | rooms / items / bedrooms+bathrooms / areas | Carpet & rugs; Upholstery & bedding; Bond & property; Specialty & urgent | Results gallery, drying times | Yes | crews in uniform, clean rooms |
| **Trades** (plumber, electrician, handyman, painter, landscaper) | Job at an address | Time windows; emergency flag | problem type, urgency, property type, photos | Repairs; Installations; Maintenance; Emergency | Licence/insurance badges, service areas map | Yes | tradie at work, tools, finished jobs |
| **Hotel / motel / Airbnb / caravan park** | Stay (check-in → check-out) | Nights per room type; capacity = rooms of that type | dates, guests (adults/children), room type, extras (breakfast, late checkout) | Rooms; Packages; Facilities; Experiences | Rooms & rates, amenities, location/attractions, gallery | No (use gallery) | rooms, pool, views, breakfast |
| **Restaurant / cafe / bar** | Table reservation | Seatings per time (e.g. every 30 min); capacity = covers | date, time, party size, occasion, dietary needs | Menu sections; Functions; Catering | Menu with prices, specials, functions enquiry, opening hours prominent | No | dishes, interior, chefs |
| **Salon / barber / beauty / spa / nails** | Appointment with a staff member | Duration-based slots per staff | service, preferred stylist, date/time, first visit? | Hair; Colour; Beauty; Packages | Team page with staff, price list, gift vouchers (as promo codes) | Yes (styles) | styling, treatments, interior |
| **Clinic / physio / dental / vet** | Appointment | Duration slots per practitioner | reason (non-clinical wording), new/returning, practitioner, date | Services by type | Practitioners, health-fund info, forms. Keep health details out of Sheets and chat; ask only what's needed to book | No | practitioners, clinic |
| **Gym / fitness / yoga / classes** | Class place or PT session | Class timetable with capacity | class/PT, experience level, date | Memberships; Classes; Personal training | Timetable, membership plans, free-trial offer | Optional (transformations, with consent) | training, classes |
| **Real estate / property management** | Inspection or appraisal request | Inspection times per property | buy/sell/rent/manage, property address, timeframe | For sale; For rent; Sold; Services | Listings (admin-managed), appraisal form | No | homes, interiors |
| **Retail / shop (no full ecommerce)** | Order enquiry or click-and-collect | Pickup slots | product, quantity, pickup date | Product categories | Product catalogue, stock status, promo codes. For a real cart and card payments, suggest Stripe as an upgrade and ask first | No | products, store |
| **Events / photography / DJ / hire** | Event date | Whole-day capacity (1 per day per team) | event type, date, venue, guests, hours | Packages; Add-ons | Portfolio, packages, availability checker | Portfolio instead | events, people |
| **Auto (detailing, mechanic, car wash)** | Vehicle job | Time windows by bay | vehicle make/model/size, service, condition | Detailing; Servicing; Repairs | Packages by vehicle size | Yes | cars, workshop |

## How to apply a preset

- **Types and data**: keep `Customer`, `Job` (rename the label, e.g. "Reservation", "Stay", "Appointment", in UI copy only), `Lead`, `Booking`, `Invoice`, `Offer`, `Promo`, `Review`.
- **Booking model** (`lib/schedule.ts`): the template uses fixed time windows (`TIME_WINDOWS`) plus `slotCapacity`. For nights-based stays, change availability to "count overlapping stays per room type ≤ rooms of that type". For staff appointments, key the slot by staff member and use the service duration.
- **Chatbot** (`lib/bot.ts`, `CHAT_OPTIONS` and `fieldQuestion` in `lib/constants.ts`): replace the per-service fields with the preset's questions. Keep the flow: service → specific questions → location/date → name → phone → confirmation that the team will contact them.
- **Sheets**: keep the Customers and Jobs tabs; rename the Jobs tab's columns to the preset wording if the owner prefers ("Reservations").
- **Invoices**: hotels and restaurants often take deposits; add a "Deposit" line rather than changing the model.
- **Wording**: search-and-replace "job", "clean", "quote" in public copy to fit the business. Admin can keep the generic words.
