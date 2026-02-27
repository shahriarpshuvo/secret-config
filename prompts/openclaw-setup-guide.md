# OpenClaw Tailscale Setup Guide for Raspberry Pi

This guide documents the complete setup process for OpenClaw with Tailscale integration on a Raspberry Pi, enabling secure remote access to the dashboard from another machine on the same Tailscale network.

## Prerequisites

- Raspberry Pi with OpenClaw installed
- Tailscale installed and configured on both the Pi and the remote machine
- Both machines connected to the same Tailscale network

## Step 1: Configure OpenClaw for Tailscale

Edit the OpenClaw configuration file to enable Tailscale integration:

```bash
nano ~/.openclaw/openclaw.json
```

Update the `gateway` section with the following changes:

### 1.1 Add Trusted Proxies

Add the `trustedProxies` configuration to allow connections from Tailscale network:

```json
"gateway": {
  "port": 3141,
  "mode": "local",
  "bind": "loopback",
  "auth": {
    "allowTailscale": true,
    "mode": "none"
  },
  "tailscale": {
    "mode": "serve",
    "resetOnExit": false
  },
  "trustedProxies": [
    "127.0.0.1",
    "100.64.0.0/10" 
  ],
  "controlUi": {
    "allowedOrigins": [
      "https://<your-pi-hostname>.<your-tailnet>.ts.net"
    ]
  }
}
```

**Key points:**
- `bind: "loopback"` - Keeps gateway secure, only accessible via Tailscale
- `trustedProxies` - Includes localhost and Tailscale network (100.64.0.0/10)
- `auth.mode: "none"` - Disables token auth for easier access (optional, can use "token" instead)
- `controlUi.allowedOrigins` - Replace `<your-pi-hostname>.<your-tailnet>` with your actual Tailscale hostname

### 1.2 Find Your Tailscale Hostname

Get your Pi's Tailscale hostname:

```bash
tailscale status
```

Look for your Pi's entry, it will show something like:
```
100.96.219.55  rpi5  user@  linux  -
```

Your full hostname will be: `rpi5.stalk-bull.ts.net` (or whatever your tailnet name is)

You can also get it from:

```bash
tailscale status --json | grep -A2 "MagicDNSSuffix\|CertDomains"
```

## Step 2: Pair Remote Devices

When you first access the dashboard from a remote machine, it will be in "pending" state. You need to manually approve it.

### 2.1 Access Dashboard from Remote Machine

On your remote machine (e.g., Mac), open a browser and navigate to:

```
https://<your-pi-hostname>.<your-tailnet>.ts.net/
```

You'll see a "pairing required" message. This creates a pending device entry.

### 2.2 Approve the Device

On your Raspberry Pi, check the pending devices:

```bash
cat ~/.openclaw/devices/pending.json
```

You'll see something like:

```json
{
  "request-id-here": {
    "requestId": "request-id-here",
    "deviceId": "device-id-here",
    "publicKey": "public-key-here",
    "platform": "MacIntel",
    "clientId": "openclaw-control-ui",
    "clientMode": "webchat",
    "role": "operator",
    "roles": ["operator"],
    "scopes": ["operator.admin", "operator.approvals", "operator.pairing"],
    "silent": false,
    "isRepair": false,
    "ts": 1772223675501
  }
}
```

Copy the entire pending device entry and add it to the paired devices file:

```bash
nano ~/.openclaw/devices/paired.json
```

Add the device to the paired list:

```json
{
  "existing-device-id": {
    ...existing config...
  },
  "new-device-id-from-pending": {
    "deviceId": "device-id-from-pending",
    "publicKey": "public-key-from-pending",
    "platform": "platform-from-pending",
    "clientId": "openclaw-control-ui",
    "clientMode": "webchat",
    "role": "operator",
    "roles": ["operator"],
    "scopes": ["operator.admin", "operator.approvals", "operator.pairing"],
    "approvedScopes": ["operator.admin", "operator.approvals", "operator.pairing"],
    "createdAtMs": <ts-value-from-pending>,
    "approvedAtMs": <current-timestamp-in-milliseconds>
  }
}
```

**Tip:** You can get the current timestamp with:

```bash
date +%s%3N
```

### 2.3 Alternative: Quick Pairing Script

For faster pairing, you can use this script:

```bash
#!/bin/bash

# Get the first pending device
PENDING=$(cat ~/.openclaw/devices/pending.json | jq -c 'to_entries | .[0]')

if [ -z "$PENDING" ]; then
    echo "No pending devices found"
    exit 1
fi

# Extract device info
DEVICE_ID=$(echo "$PENDING" | jq -r '.value.deviceId')
PUBLIC_KEY=$(echo "$PENDING" | jq -r '.value.publicKey')
PLATFORM=$(echo "$PENDING" | jq -r '.value.platform')
TS=$(echo "$PENDING" | jq -r '.value.ts')
CURRENT_TS=$(date +%s%3N)

# Create new paired device entry
jq --arg deviceId "$DEVICE_ID" \
   --arg publicKey "$PUBLIC_KEY" \
   --arg platform "$PLATFORM" \
   --argjson ts "$TS" \
   --argjson currentTs "$CURRENT_TS" \
   '. + {
     ($deviceId): {
       "deviceId": $deviceId,
       "publicKey": $publicKey,
       "platform": $platform,
       "clientId": "openclaw-control-ui",
       "clientMode": "webchat",
       "role": "operator",
       "roles": ["operator"],
       "scopes": ["operator.admin", "operator.approvals", "operator.pairing"],
       "approvedScopes": ["operator.admin", "operator.approvals", "operator.pairing"],
       "createdAtMs": $ts,
       "approvedAtMs": $currentTs
     }
   }' ~/.openclaw/devices/paired.json > /tmp/paired_temp.json && mv /tmp/paired_temp.json ~/.openclaw/devices/paired.json

echo "Device $DEVICE_ID approved successfully"
```

Save as `~/approve-device.sh`, make executable, and run:

```bash
chmod +x ~/approve-device.sh
~/approve-device.sh
```

## Step 3: Configure Systemd Service

Update the existing systemd service to use the correct port and Tailscale settings.

### 3.1 Edit Service File

```bash
nano ~/.config/systemd/user/openclaw-gateway.service
```

Update these two lines:

**Original:**
```
ExecStart=/usr/bin/node /home/shahriarpshuvo/.npm-global/lib/node_modules/openclaw/dist/index.js gateway --port 18789
Environment=OPENCLAW_GATEWAY_PORT=18789
```

**Changed to:**
```
ExecStart=/usr/bin/node /home/shahriarpshuvo/.npm-global/lib/node_modules/openclaw/dist/index.js gateway --port 3141 --tailscale serve --auth none
Environment=OPENCLAW_GATEWAY_PORT=3141
```

**Note:** Replace `/home/shahriarpshuvo/` with the actual home directory path for your user.

### 3.2 Complete Service File Example

Here's what the complete service file should look like:

```ini
[Unit]
Description=OpenClaw Gateway (v2026.2.26)
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/node /home/your-username/.npm-global/lib/node_modules/openclaw/dist/index.js gateway --port 3141 --tailscale serve --auth none
Restart=always
RestartSec=5
KillMode=process
Environment=HOME=/home/your-username
Environment=TMPDIR=/tmp
Environment=PATH=/home/your-username/.local/bin:/home/your-username/.npm-global/bin:/home/your-username/bin:/usr/local/bin:/usr/bin:/bin
Environment=OPENCLAW_GATEWAY_PORT=3141
Environment=OPENCLAW_GATEWAY_TOKEN=your-token-here
Environment=OPENCLAW_SYSTEMD_UNIT=openclaw-gateway.service
Environment=OPENCLAW_SERVICE_MARKER=openclaw
Environment=OPENCLAW_SERVICE_KIND=gateway
Environment=OPENCLAW_SERVICE_VERSION=2026.2.26

[Install]
WantedBy=default.target
```

**Important:** Update all instances of `/home/shahriarpshuvo/` to match your actual home directory path.

### 3.3 Apply Changes

Reload systemd daemon and restart the service:

```bash
systemctl --user daemon-reload
systemctl --user enable openclaw-gateway.service
systemctl --user start openclaw-gateway.service
```

## Step 4: Verify Setup

### 4.1 Check Service Status

```bash
systemctl --user status openclaw-gateway.service
```

Should show: `Active: active (running)`

### 4.2 Check Tailscale Serve

```bash
tailscale serve status
```

Should show:
```
https://<your-pi-hostname>.<your-tailnet>.ts.net (tailnet only)
|-- / proxy http://127.0.0.1:3141
```

### 4.3 Check Service is Enabled

```bash
systemctl --user is-enabled openclaw-gateway.service
```

Should return: `enabled`

### 4.4 Test Remote Access

On your remote machine, open a browser and navigate to:

```
https://<your-pi-hostname>.<your-tailnet>.ts.net/
```

The OpenClaw dashboard should load successfully.

## Step 5: Service Management Commands

### View Real-time Logs

```bash
journalctl --user -u openclaw-gateway.service -f
```

### Check Service Status

```bash
systemctl --user status openclaw-gateway.service
```

### Restart Service

```bash
systemctl --user restart openclaw-gateway.service
```

### Stop Service

```bash
systemctl --user stop openclaw-gateway.service
```

### Start Service

```bash
systemctl --user start openclaw-gateway.service
```

### View Service Logs

```bash
# View recent logs
journalctl --user -u openclaw-gateway.service -n 50

# Follow logs in real-time
journalctl --user -u openclaw-gateway.service -f
```

## Troubleshooting

### Issue: "origin not allowed" error

**Solution:** Make sure `controlUi.allowedOrigins` includes your Tailscale hostname:

```json
"controlUi": {
  "allowedOrigins": [
    "https://<your-pi-hostname>.<your-tailnet>.ts.net"
  ]
}
```

### Issue: "Proxy headers detected from untrusted address"

**Solution:** Add both localhost and Tailscale network to `trustedProxies`:

```json
"trustedProxies": [
  "127.0.0.1",
  "100.64.0.0/10"
]
```

### Issue: "pairing required" persists after approval

**Solution:**
1. Stop the service: `systemctl --user stop openclaw-gateway.service`
2. Clear pending devices: `echo "{}" > ~/.openclaw/devices/pending.json`
3. Restart service: `systemctl --user start openclaw-gateway.service`
4. Re-access dashboard from remote machine
5. Approve the new pending device

### Issue: Service fails to start

**Check:**
1. Verify the path to OpenClaw is correct: `which openclaw`
2. Check service logs: `journalctl --user -u openclaw-gateway.service -n 50`
3. Verify Tailscale is running: `tailscale status`
4. Check if port 3141 is already in use: `netstat -tulpn | grep 3141`

### Issue: Can't access from remote machine

**Check:**
1. Both machines are on the same Tailscale network: `tailscale status`
2. Tailscale Serve is running: `tailscale serve status`
3. Service is running: `systemctl --user status openclaw-gateway.service`
4. Firewall isn't blocking connections (though Tailscale usually bypasses this)

## Security Considerations

### Current Setup (Auth Mode: none)

With `auth.mode: "none"`, anyone on your Tailscale network can access the dashboard without authentication.

### More Secure Alternative (Auth Mode: token)

For better security, use token authentication:

1. Change auth mode in `~/.openclaw/openclaw.json`:

```json
"auth": {
  "allowTailscale": true,
  "mode": "token",
  "token": "your-secure-random-token-here"
}
```

2. Generate a secure token:

```bash
openssl rand -hex 24
```

3. Update systemd service file to include the token:

```bash
nano ~/.config/systemd/user/openclaw-gateway.service
```

Add/update:
```
Environment=OPENCLAW_GATEWAY_TOKEN=your-secure-random-token-here
```

4. Update ExecStart to use token auth:

```
ExecStart=/usr/bin/node /home/your-username/.npm-global/lib/node_modules/openclaw/dist/index.js gateway --port 3141 --tailscale serve --auth token
```

5. Reload and restart:

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
```

6. When accessing from remote machine, include the token in the URL:

```
https://<your-pi-hostname>.<your-tailnet>.ts.net/?auth=your-secure-random-token-here
```

## Summary

After completing this setup:

- ✅ OpenClaw runs automatically on boot via systemd
- ✅ Dashboard accessible via Tailscale at `https://<hostname>.<tailnet>.ts.net/`
- ✅ Service auto-restarts on crash
- ✅ Remote devices can be paired for access
- ✅ All connections secured via Tailscale encryption

## Configuration Files Reference

### Main Configuration File

Location: `~/.openclaw/openclaw.json`

Key sections modified:
- `gateway.trustedProxies` - Allow Tailscale network
- `gateway.controlUi.allowedOrigins` - CORS configuration
- `gateway.tailscale` - Tailscale Serve mode
- `gateway.auth` - Authentication settings

### Paired Devices File

Location: `~/.openclaw/devices/paired.json`

Contains approved remote devices that can access the dashboard.

### Systemd Service File

Location: `~/.config/systemd/user/openclaw-gateway.service`

Defines how OpenClaw runs as a service, including port, flags, and environment variables.

## Enable linger

For services to start at boot without login, enable linger:

```bash
loginctl enable-linger $USER
```

This ensures services start automatically when the system boots, even without a user login session.
