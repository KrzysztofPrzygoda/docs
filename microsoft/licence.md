# Windows SLMGR and Product Key Recovery – Cheat Sheet

## 🔐 Adding and Activating a Product Key

### Add a Product Key
```
slmgr /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
```
Installs a new product key.

### Activate Windows
```
slmgr /ato
```
Attempts to activate Windows online.

---

## ❌ Removing a Product Key

### Uninstall Product Key (Deactivation)
```
slmgr /upk
```
Uninstalls the current product key from the system.

### Clear Key from Registry
```
slmgr /cpky
```
Removes the product key from the Windows registry.

---

## 🔍 License and Activation Status

### View Basic License Info
```
slmgr /dli
```
Displays basic info about the license type and activation status.

### View Detailed License Info
```
slmgr /dlv
```
Shows a detailed license and activation status report.

### Check Activation Expiration
```
slmgr /xpr
```
Tells whether the system is permanently activated or time-limited.

---

## 🔎 Recovering Product Key

### From BIOS/UEFI (PowerShell)
```powershell
(Get-WmiObject -query 'select * from SoftwareLicensingService').OA3xOriginalProductKey
```
Retrieves the embedded product key from BIOS/UEFI (common on prebuilt PCs/laptops).

### From Windows Registry (PowerShell)
```powershell
function Get-WindowsKey {
    $key = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"
    $digitalProductId = (Get-ItemProperty -Path $key).DigitalProductId
    $productKey = ([System.Text.Encoding]::Default.GetString($digitalProductId[52..66])) -replace '[^\w\d]', ''
    return $productKey
}
Get-WindowsKey
```
Attempts to extract the product key from the registry. May not work on all Windows versions.

> Note: These methods only work if the key is stored locally.

---

## Recovering License via Microsoft Account

1. Sign in to Windows using your **Microsoft account** (same one used before).
2. Go to:
   ```
   Settings > System > Activation
   ```
3. Click **Troubleshoot**.
4. Select **"I changed hardware on this device recently"**.
5. Choose the previous device from the list and click:
   **"This is the device I'm using right now"**.

---

## Additional Notes

- **Check License Type (Retail/OEM/Volume)**:
```
slmgr /dli
```

- **Link Windows license to your Microsoft Account** (recommended for future transfers):
  Go to Settings → System → Activation → Add a Microsoft account

---
