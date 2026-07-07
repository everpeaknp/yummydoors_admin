# Known Pitfalls

- Empty approvals queue can be auth or environment mismatch, not only "no applications".
- Admin login must stay separate from customer login semantics.
- This repo can be mistaken for the merchant portal; it is not.
- Server-backed testing is easy to confuse with local backend testing; verify which API origin the repo is targeting.
