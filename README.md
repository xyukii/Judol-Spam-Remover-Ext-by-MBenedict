# TUTORIAL MEMAKAI CHROME EXTENSION JUDOL SLAYER INI (FREE NO ROOT NO JAIL BREAK 🏛️)

DISCLAIMER :
- Extension ini tidak bisa jalan <strong><em>24 JAM</em></strong>.
- Penggunaannya hanya untuk yang punya channel Youtube <strong><em>BUKAN VIEWERS</em></strong>, ntar error bingung lu malah.
- Scan commentnya hanya di <strong><em>1 VIDEO</em></strong> bukan 1 channel, meledak PC lu kalo 1 channel punya 100 video trus di scan 💥.

MIT LICENSE JADI UNTUK PARA DEVELOPER SILAHKAN DI FORK/CLONE DAN DIKEMBANGKAN (Kalo mau)

Chapter 1 : Setup
1. Pencet tombol code warna hijau trus pencet <strong><em>Download ZIP</em></strong>
2. Masukin dalam file trus Extract ZIPnya
3. Buka Chrome trus ketik chrome://extensions trus developer mode di kanan atas dianyalain
4. Pencet Load Unpacked trus pilih file tadi yang isinya hasil extract ZIP
5. catat IDnya

![Screenshot 2025-04-25 212315](https://github.com/user-attachments/assets/47f6780f-b777-4066-85f6-11d3c493e48b)

Chapter 2 : OAuth Client
1. Ketik di google <strong><em>Google Cloud Console</em></strong>

![Screenshot 2025-04-25 210936](https://github.com/user-attachments/assets/5958933e-ce4b-4fdd-88a7-cf57c5d647f3)

2. Masuk "APIs & Services" → "Library"
   
![Screenshot 2025-04-25 211058](https://github.com/user-attachments/assets/073a7eb7-2809-4da4-9fb2-ecef21804922)

4. Cari dan klik <strong><em> YouTube Data API v3 </em></strong> trus klik <strong><em>ENABLE</em></strong>
5. Balik lagi ke "APIs & Services" trus ke "OAuth consent screen"

![Screenshot 2025-04-25 211411](https://github.com/user-attachments/assets/75fa4186-819c-4bca-bc7a-d39639f6d00f)

7. Pencet Get Started trus lengkapin aja step-stepnya trus create (buat step 2 pilih yang <strong><em>EXTERNAL</em>)

![Screenshot 2025-04-25 213550](https://github.com/user-attachments/assets/f2232bb8-7585-4a1a-843d-de954c2a4614)
![Screenshot 2025-04-25 213557](https://github.com/user-attachments/assets/c5d65834-3e5a-4ec6-a01f-ffca8d9999e4)

9. Pencet Create OAuth Client

![Screenshot 2025-04-25 213344](https://github.com/user-attachments/assets/2c4cb1d3-d8ad-4bb5-8173-f27296251eb6)

11. Pilih Application type Chrome Extensions habis trus ID extension yang tadi masukkin ke inputan trus create(gausa peduliin verify karena ini local)

![Screenshot 2025-04-25 213642](https://github.com/user-attachments/assets/e3805adf-a898-4ad0-8320-85fcf894d48d)

13. Copy Client ID nya

Chapter 3 : Last Chapter 
1. Buka file extensionnya trus cari manifest.json 
2. Buka manifest.json (BISA PAKE NOTEPAD)
3. ganti client_id di bagian yang ini sama client ID yang tadi :
"oauth2": {
   "client_id": "YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com", <---- yang ini
   "scopes": ["https://www.googleapis.com/auth/youtube.force-ssl"]
},
5. Di save habis itu masuk lagi ke chrome://extensions trus pencet tombol reload

<h3>DAH SLESAI TUH SPAM JUDOL</h3>
