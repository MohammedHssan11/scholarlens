# Release checklist

**Owner:** Mohammed Hassan Mahmoud (Integration Lead)

Run through this before every release to `main`.

## Build & quality
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] Tests pass, output saved as evidence

## Security
- [ ] No secret in the repository or in client bundles
- [ ] `.env.example` documents every variable (values empty)
- [ ] Environment variables set in Vercel (server-side only)
- [ ] Invalid input returns a safe error and does NOT call the provider

## Product
- [ ] Main user journey works end to end on the preview URL
- [ ] Loading / empty / error / retry states all visible
- [ ] Every answer shows a source snippet, or says "no evidence found"
- [ ] Works on mobile width

## Smoke tests (record date + result)
- [ ] local
- [ ] preview
- [ ] production

## Evidence collected
- [ ] Build logs
- [ ] Public production URL
- [ ] Environment checklist
- [ ] Screenshots
- [ ] Known limitations updated
- [ ] Contribution matrix updated

## Sign-off
- [ ] Checked independently against the scoring rubric
- [ ] Every member can explain and modify their own module

Signed: ______________________  Date: ____________
