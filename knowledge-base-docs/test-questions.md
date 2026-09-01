# Test Questions — RAG vs Base-Model Comparison

Ask each question twice: once through `POST /api/v1/ask` (RAG — retrieves
from the Knowledge Base then generates with Nova Lite), and once directly
against the base Nova Lite model with no retrieval step (plain
`invoke_model`). Record both answers in `rag-vs-base-comparison.md`.

## Status

These 5 questions target my own 3 uploaded documents (visa requirements,
Yogyakarta guide, company travel policy), which are pending sync into the
shared class Knowledge Base by the Alkademi team as of 2026-09-01. Once
synced, run these and append results to `rag-vs-base-comparison.md`.

In the meantime, `rag-vs-base-comparison.md` already contains a full 5-question
RAG vs base-model run against documents already present in the shared KB
(from other groups), which validates the `/api/v1/ask` endpoint end-to-end.

## Questions (for my documents, once synced)

1. **What is KelanaAI's partner code for the Japan e-Visa expedited processing track, and how many business days does expedited processing take?**
   _Expects (from KB): partner code JP-KLN-2091, 3 business days. A base model has no way to know this — it's a fictional internal detail._

2. **Do I need Finance team approval to book a Luxury category trip under USD 1,500 through KelanaAI?**
   _Expects (from KB): yes — Luxury bookings always require Finance pre-approval regardless of the USD 1,500 self-approval threshold. A base model would likely guess based on the budget threshold alone and say no approval is needed, since it doesn't know about the Luxury-specific exception._

3. **What is the special lunch deal for KelanaAI travelers in Yogyakarta, and where is it?**
   _Expects (from KB): Warung Handayani near Taman Sari, IDR 35,000 set-menu lunch for travelers who mention the "KelanaAI Explorer" code. A base model may know Yogyakarta food spots generically but cannot know this specific unlisted deal._

4. **How many days after completing a trip does a KelanaAI employee have to submit a reimbursement claim?**
   _Expects (from KB): 14 calendar days. A base model has no company-specific policy to draw from and will either refuse to answer or give a generic/incorrect guess._

5. **Can Indonesian passport holders enter Vietnam visa-free, and what's different about KelanaAI's "Extended Explorer" package regarding Vietnam visas?**
   _Expects (from KB): visa-free up to 30 days; Extended Explorer trips over 30 days need a USD 25 e-Visa applied for at least 10 business days ahead. A base model may correctly know the general 30-day visa-free rule (real-world fact) but cannot know the KelanaAI-specific "Extended Explorer" package detail._
