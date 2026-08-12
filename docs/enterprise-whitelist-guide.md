# Hupo AI Sales Training Platform - Network Whitelist Guide

## Overview

This document provides the required domains for corporate firewall/proxy whitelisting to ensure full functionality of the Hupo AI Sales Training Platform.

---

## Required Domains

### Core Application (Required)

| Domain | Purpose | Protocol |
|--------|---------|----------|
| `train.hupo.co` | Web application | HTTPS (443) |
| `trainapi.hupo.co` | API backend | HTTPS (443) |
| `auth.hupo.co` | Authentication | HTTPS (443) |
| `cdn.auth0.com` | Auth assets | HTTPS (443) |

### Voice Features (Required for roleplay sessions)

| Domain | Purpose | Protocol |
|--------|---------|----------|
| `hupo-jwope3nh.livekit.cloud` | Real-time voice (multi-language) | HTTPS (443), WSS |
| `api.elevenlabs.io` | AI voice synthesis | HTTPS (443) |
| `*.elevenlabs.io` | Voice streaming | HTTPS (443), WSS |

### Media & Assets (Required)

| Domain | Purpose | Protocol |
|--------|---------|----------|
| `dopmo1eihgbgm.cloudfront.net` | Media CDN | HTTPS (443) |

---

## Web Isolation / Browser Isolation

If your organization uses web isolation (Menlo Security, Symantec, Zscaler, etc.), these domains **must be excluded from isolation**:

- `train.hupo.co`
- `auth.hupo.co`
- `cdn.auth0.com`
- `hupo-jwope3nh.livekit.cloud`

> **Important:** Web isolation interferes with OAuth authentication and WebSocket connections. Users will experience "Authentication failed" errors if these domains are isolated.

---

## SSL Inspection / TLS Interception

If your organization performs SSL inspection (TLS interception) via a proxy (Zscaler, Palo Alto, Forcepoint, Blue Coat, etc.), the following domains **must be added to the SSL inspection bypass list**:

| Domain | Reason |
|--------|--------|
| `*.elevenlabs.io` | Voice streaming uses persistent WSS connections that break under TLS interception |
| `hupo-jwope3nh.livekit.cloud` | Real-time voice uses persistent WSS connections that break under TLS interception |

> **Why is this needed?** SSL inspection decrypts and re-encrypts traffic via a proxy certificate. This breaks WebSocket (WSS) connections used for real-time voice streaming because:
> - WSS connections are long-lived and persistent — proxies cannot reliably maintain interception on streaming data
> - The added latency from decryption/re-encryption degrades real-time audio quality
> - Client-side SDKs may reject the proxy's substituted certificate
>
> **Symptom:** Domains are whitelisted and allowed in URL filtering, but voice sessions still fail to connect or produce no audio.
>
> **Solution:** Add an SSL inspection bypass rule for the domains above. You can still control access using URL filtering (allow/deny by domain) without needing to decrypt the traffic.

---

## Firewall Rules Summary

```
HTTPS (TCP 443):
  train.hupo.co
  trainapi.hupo.co
  auth.hupo.co
  cdn.auth0.com
  hupo-jwope3nh.livekit.cloud
  api.elevenlabs.io
  *.elevenlabs.io
  dopmo1eihgbgm.cloudfront.net

WebSocket Secure (WSS 443):
  hupo-jwope3nh.livekit.cloud
  *.elevenlabs.io
```

---

## Verification

After whitelisting, verify by:
1. Navigate to `https://train.hupo.co` and complete login
2. Start a practice session to test voice features

---

## Support

Contact: **security@hupo.co**
