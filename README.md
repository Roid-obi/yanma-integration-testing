# Dokumentasi Unit Testing JavaScript/Node.js dengan Jest

<div align="center">
  <img height="170" src="https://icon.icepanel.io/Technology/svg/Jest.svg" />
</div>

Dokumen ini memandu **kamu** dalam melakukan Unit Testing untuk kode JavaScript/Node.js dalam proyek ini menggunakan **Jest**, sebuah *framework* pengujian yang menyenangkan.

## 🤝 Kolaborasi (Collaboration)

Untuk bekerja secara kolaboratif dalam proyek ini, khususnya saat menambahkan atau memodifikasi *unit test*, **kamu** harus mengikuti alur kerja Git standar.

### 1\. **Clone Repositori**

```bash
git clone https://github.com/Roid-obi/Yanma_Testing.git
cd yanma-testing
```

### 2\. **Buat Branch Baru untuk Testing**

Sebelum memulai pekerjaan, **selalu** buat *branch* baru, ya\! Ini penting supaya perubahan **kamu** terisolasi dan nggak merusak *branch* utama (`main` atau `master`). Untuk *unit testing*, ikuti format penamaan `test/[nama-kamu]`.

```bash
# Ganti [nama-kamu] dengan nama kamu (misalnya, 'test/budi' atau 'test/farah')
git checkout -b test/[nama-kamu] 
```

*Perintah ini secara otomatis akan memindahkan **kamu** ke branch baru yang sudah dibuat.*

### 3\. **Instalasi Dependensi**

Pastikan semua *dependency* (termasuk Jest) terinstal di lingkungan lokal **kamu**:

```bash
npm install
```

*Langkah ini perlu dilakukan setelah cloning atau kalau ada perubahan pada `package.json`.*

-----

## 🚀 Quick Setup (Penyiapan Cepat)

Ikuti langkah-langkah di bawah ini di Terminal atau Command Prompt **setelah kamu berada di *branch* baru kamu**:

1.  **Inisialisasi Proyek Node.js:**

    ```bash
    npm init -y
    ```

    *(Hanya jika belum diinisialisasi)*

2.  **Instalasi Jest:**
    Instal Jest sebagai *dependency* pengembangan (*dev dependency*).

    ```bash
    npm install jest --save-dev
    ```

3.  **Struktur Folder & File:**
    Buat struktur dasar untuk kode sumber (`src`) dan *file* pengujian (`__tests__`).

    ```bash
    mkdir src
    mkdir __tests__
    # Buat file logika (kode yang akan diuji)
    touch src/namaTestCase.js 
    # Buat file pengujian
    touch __tests__/namaTestCase.test.js 
    ```

4.  **Konfigurasi `package.json`:**
    Edit *file* `package.json` **kamu** dan tambahkan *script* `test` di bagian `"scripts"`:

    ```json
    "scripts": {
        "test": "jest"
    },
    ```

-----

## 🛠️ Cara Menjalankan Pengujian

Untuk menjalankan semua *unit test* yang ada dalam proyek (semua *file* `*.test.js`), ketik perintah ini di Terminal:

```bash
npm run test
```

-----

## 📤 Menyelesaikan Pekerjaan dan Mengirim Perubahan

Setelah **kamu** selesai menulis *unit test* dan memastikan semuanya lulus (`npm run test` berhasil):

1.  **Stage (Tambahkan) Perubahan:**

    ```bash
    git add .
    ```

2.  **Commit Perubahan:**
    Tulis pesan *commit* yang deskriptif ya.

    ```bash
    git commit -m "feat(testing): tambahkan unit test untuk [nama-fitur]"
    ```

3.  **Push Branch ke Repositori Jarak Jauh (Remote):**

    ```bash
    git push origin test/[nama-kamu]
    ```

4.  **Buat Pull Request (PR):**
    Akses platform Git (misalnya, GitHub) dan buat *Pull Request* dari *branch* `test/[nama-kamu]` **kamu** ke *branch* utama (`main`) supaya *unit test* **kamu** bisa ditinjau dan digabungkan.