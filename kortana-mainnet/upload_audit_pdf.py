
import requests
import hashlib
import time
import os

CLOUD_NAME = "drha3dagy"
API_KEY = "387253297974617"
API_SECRET = "m8FPHe-gC1R9dDcOazmH1Lnr4QI"
PDF_PATH = r"c:\Users\emi\Desktop\blockchains\kortanablockchain-devhub\kortana-mainnet\KORTANA_SECURITY_AUDIT_REPORT.pdf"

def cloudinary_upload_raw(file_path):
    """Upload PDF as raw so the original PDF file is served, not rasterised."""
    timestamp = str(int(time.time()))
    public_id = "kortana-security-audit-report-2026"
    folder = "kortana-docs"
    resource_type = "raw"

    # fl_inline is baked into the delivery URL, not upload params
    params_to_sign = f"folder={folder}&public_id={public_id}&timestamp={timestamp}"
    sig_str = params_to_sign + API_SECRET
    signature = hashlib.sha1(sig_str.encode()).hexdigest()

    url = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/{resource_type}/upload"

    with open(file_path, 'rb') as f:
        resp = requests.post(url, data={
            "api_key": API_KEY,
            "timestamp": timestamp,
            "signature": signature,
            "public_id": public_id,
            "folder": folder,
        }, files={"file": (os.path.basename(file_path), f, "application/pdf")})

    if resp.status_code == 200:
        data = resp.json()
        raw_url = data.get('secure_url')
        # fl_inline forces Content-Disposition: inline so browsers display it
        inline_url = raw_url.replace("/raw/upload/", "/raw/upload/fl_inline/")
        # Google Docs viewer URL – most browser-compatible way to embed any PDF
        import urllib.parse
        gdocs_url = f"https://docs.google.com/viewer?url={urllib.parse.quote(raw_url, safe='')}&embedded=true"

        print("Upload SUCCESS (raw)!")
        print(f"  Raw URL    : {raw_url}")
        print(f"  Inline URL : {inline_url}")
        print(f"  GDocs URL  : {gdocs_url}")

        with open("cloudinary_audit_url.txt", "w") as f2:
            f2.write(inline_url)
        with open("cloudinary_audit_gdocs.txt", "w") as f3:
            f3.write(gdocs_url)

        return raw_url, inline_url, gdocs_url
    else:
        print(f"Upload FAILED: {resp.status_code}")
        print(resp.text)
        return None, None, None

if __name__ == "__main__":
    cloudinary_upload_raw(PDF_PATH)
