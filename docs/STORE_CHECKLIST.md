# Store launch checklist (Phase 3)

Prototype / vertical-slice code ships one web build; each store wraps it.

## Shared

- [ ] Privacy nutrition labels / data-safety forms (no account, no tracking by default)
- [ ] IARC rating questionnaire
- [ ] Comfort options documented in store description (FOV, reduce motion)
- [ ] Content rating: no violence / no horror jumpscares — liminal unease

## App Store (iOS) via Capacitor

- [ ] Install CocoaPods (`brew install cocoapods`) then `npx cap add ios`
- [ ] Apple Developer account + certificates
- [ ] `npm run cap:sync`
- [ ] NSPrivacy* manifests if any SDK collects data
- [ ] TestFlight internal build

## Google Play via Capacitor

- [ ] Play Console app + signing key
- [ ] `npx cap add android` then `npm run cap:sync`
- [ ] Target API level current Play requirement
- [ ] Internal testing track on mid-tier device (perf go/no-go)

## Steam (Win/Mac) via Electron

- [ ] Steamworks app ID
- [ ] Age gate configuration
- [ ] Depot upload from Electron packaged build
- [ ] Store page capsules / trailer

Do not treat this checklist as complete until each store's first internal build is uploaded.
