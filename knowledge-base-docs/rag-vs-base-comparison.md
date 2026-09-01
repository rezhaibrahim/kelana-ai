# RAG vs Base-Model Comparison — Session 9 (Expand the KB)

## Endpoint under test

`POST /api/v1/ask` (new this session, in `backend/main.py` + `backend/services/knowledge_base_service.py`) — retrieves relevant chunks from the Bedrock Knowledge Base (`Retrieve` API) and generates a grounded answer with Amazon Nova Lite. Compared against a plain `invoke_model` call to the same Nova Lite model with no retrieval step (the "base model" baseline).

## Knowledge Base status

This is a class-shared Knowledge Base (`KNOWLEDGE_BASE_ID=EW7EM5BPON`). Documents are uploaded by each group to a shared Google Drive folder; the Alkademi team selects and syncs 3 documents per group into the Knowledge Base's S3 data source.

- **My 3 new documents** (`visa-requirements-southeast-asia.md`, `destination-guide-yogyakarta.md`, `company-travel-policy.md`) were uploaded to the shared Google Drive folder on 2026-09-01. **Not yet synced** into the Knowledge Base as of this writing — confirmed by querying the KB for facts unique to these docs (e.g. the fictional partner code "JP-KLN-2091") and getting "I don't have that information."
- To validate the RAG pipeline end-to-end without waiting on that sync, the 5 test questions below target **documents already in the shared KB from other groups**, confirmed present via sampling queries: `Kazakhstan.pdf`, `original-Koryo_Tours_North_Korea_Guide_2019.pdf`, `indonesian-traveler-payment-guide.md`, plus Tokyo/Kyoto/Osaka guides and a Japan visa PDF.
- **TODO once my documents are synced:** re-run the 5 questions in `test-questions.md` (which target my own documents specifically) and append those results below.

## Question-by-question comparison

### 1. Kazakhstan tour single-room supplement fee

**Question:** What is the single room supplement fee per night for the Koryo Tours Kazakhstan tour package, and is it available on the train option?

**RAG answer (Knowledge Base):**
> The single room supplement fee per night for the Koryo Tours Kazakhstan tour package is 30 USD. However, it is not available on the train option.

**Base-model answer (Nova Lite, no KB):**
> The Koryo Tours Kazakhstan tour package typically includes various accommodation options, and the single room supplement fee can vary depending on the specific tour itinerary... Generally, the single room supplement fee can range from $200 to $400 per night... it's best to directly contact Koryo Tours or visit their official website.

**Verdict:** RAG gave the exact correct figure (30 USD, not available on train) straight from the document. The base model invented a wildly wrong range ($200–400/night) and hedged with generic advice — a confident-sounding but fabricated answer.

---

### 2. Indonesian cross-border mobile payment system name

**Question:** Can Indonesian travelers use their domestic Indonesian mobile payment app to pay directly in shops abroad, and what is this cross-border system called?

**RAG answer (Knowledge Base):**
> Yes... This cross-border system is called **Cross-Border QRIS (QRIS Antarnegara)**.

**Base-model answer (Nova Lite, no KB):**
> ...through a system known as "**GarudaQR**." ... The name "Garuda" comes from the national airline of Indonesia... Some of the major banks and payment providers involved include Bank Mandiri, BRI, BCA, BNI...

**Verdict:** This is the clearest case. RAG correctly named the real system (Cross-Border QRIS / QRIS Antarnegara). The base model **hallucinated an entirely fictional system name** ("GarudaQR") with fabricated supporting details (bank partnerships, an invented origin story for the name) that sound completely plausible but do not exist. This is a strong example of why ungrounded generation is risky for factual/product information.

---

### 3. North Korea guide — is the printed guide allowed into the country

**Question:** According to the Koryo Tours North Korea guide, is the guide itself allowed to be brought into North Korea during travel?

**RAG answer (Knowledge Base):**
> No... DPRK customs prohibits written materials, printed and electronic, about the DPRK from entry into the country.

**Base-model answer (Nova Lite, no KB):**
> ...the specific policy on whether **guides** [it interpreted "guide" as the tour guide person, not the document] are allowed to accompany travelers into North Korea can vary... guides typically do not enter North Korea with the tourists... it's essential to check the most current information from Koryo Tours...

**Verdict:** RAG correctly answered the actual question asked (about the printed guide document being customs-prohibited). The base model misread the question entirely — it answered about human tour guides instead of the guide document, because it had no source text to ground the ambiguous word "guide" in. This shows RAG doesn't just add facts, it also disambiguates the question using real context.

---

### 4. Koryo Tours daily tip range

**Question:** What percentage range should travelers tip local guides and drivers per day on a Koryo Tours package, in USD?

**RAG answer (Knowledge Base):**
> Travelers should tip local guides and drivers approximately 10-15 USD per day.

**Base-model answer (Nova Lite, no KB):**
> ...typically tip local guides and drivers in the range of **5 to 15 USD** per day...

**Verdict:** RAG matched the document exactly (10–15 USD). The base model's guess (5–15 USD) overlaps but widens the range incorrectly on the low end — plausible-sounding but not what the actual policy says.

---

### 5. Alternative payment method when QRIS isn't supported

**Question:** Besides QRIS, what alternative payment method does the Indonesian traveler guide recommend for destinations where QRIS isn't supported?

**RAG answer (Knowledge Base):**
> ...multi-currency digital debit cards or international cards. Specifically: Debit Cards with Visa/Mastercard Logo... Multi-Currency Accounts: services such as **Jenius (BTPN), Bank Jago, and Wise**...

**Base-model answer (Nova Lite, no KB):**
> ...recommend **cash** as an alternative payment method... carry sufficient Indonesian Rupiah (IDR)... withdraw local currency before departing...

**Verdict:** RAG cited the specific services actually recommended in the document (Jenius, Bank Jago, Wise multi-currency accounts). The base model gave generic, plausible-but-unrelated travel advice (carry cash) that isn't what the source document says at all.

## Overall takeaway

RAG (via the new `/api/v1/ask` endpoint) answered all 5 questions correctly and specifically, grounded in the actual source documents. The base model (same Nova Lite model, no retrieval step) got **0 of 5 fully correct** — it either invented specific numbers/names outright (Q1's $200–400 range, Q2's fabricated "GarudaQR" system), misinterpreted the question due to lack of context (Q3), or gave generic advice unrelated to the actual documented recommendation (Q5). Q2 is the standout example: the base model confidently fabricated a fake product name with supporting fictional details, which is exactly the kind of hallucination risk RAG is designed to eliminate by grounding answers in real, retrievable source text instead of the model's parametric memory alone.

This confirms the core value of expanding KelanaAI's Knowledge Base: every new document added directly and measurably improves answer accuracy for questions that touch that document's content, which a base model has no way to access no matter how it's prompted.
