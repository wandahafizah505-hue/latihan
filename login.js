let daftarSiswa = [];

// ==========================================
// KONFIGURASI SERVER INTERNET (JSONBin)
// ==========================================
const API_URL = "https://api.jsonbin.io/v3/b";
const API_KEY = "$2a$10$7v5K3n.8qR8kXzQ7YgW9u.P8zL1K0bW3xR2N7YgW9u.P8zL1K0bW"; // Ganti jika punya master key sendiri

// FUNGSI UNTUK KIRIM DATA KE SERVER INTERNET
async function simpanKeServer(dataBaru) {
    try {
        let response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY,
                "X-Bin-Private": "false"
            },
            body: JSON.stringify(dataBaru)
        });

        if (response.ok) {
            console.log("Data berhasil dikirim dan tersimpan di server internet!");
        } else {
            console.error("Gagal menyimpan ke server");
        }
    } catch (error) {
        console.error("Error koneksi server:", error);
    }
}

function login() {
    let nama = document.getElementById("username").value.trim();

    if (nama === "") {
        document.getElementById("pesan").innerText = "Nama siswa wajib diisi!";
        return;
    }

    document.getElementById("pesan").innerText = "";
    document.getElementById("nama").innerText = nama;
    document.getElementById("tampilKelas").innerText = "11 RPL";

    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("nilaiBox").classList.remove("hidden");
}

document.getElementById("nilai").addEventListener("input", function () {
    let val = this.value;
    if (val === "") {
        document.getElementById("grade").innerText = "-";
        document.getElementById("kondisi").innerText = "-";
        return;
    }

    let { grade, kondisi } = hitungGrade(Number(val));
    document.getElementById("grade").innerText = grade;
    document.getElementById("kondisi").innerText = kondisi;
});

function hitungGrade(nilai) {
    if (nilai < 0 || nilai > 100 || isNaN(nilai)) return { grade: "-", kondisi: "Tidak Valid" };
    if (nilai <= 50) return { grade: "D", kondisi: "Tidak Lulus" };
    if (nilai <= 70) return { grade: "C", kondisi: "Tidak Lulus" };
    if (nilai <= 85) return { grade: "B", kondisi: "Lulus" };
    return { grade: "A", kondisi: "Lulus" };
}

async function tambahData() {
    let nama = document.getElementById("nama").innerText;
    let kelas = "11 RPL";
    let inputNilai = document.getElementById("nilai").value;

    if (inputNilai === "") {
        alert("Masukkan nilai terlebih dahulu!");
        return;
    }

    let nilai = Number(inputNilai);
    let { grade, kondisi } = hitungGrade(nilai);

    if (kondisi === "Tidak Valid") {
        alert("Nilai harus antara 0 - 100!");
        return;
    }

    let dataBaru = { nama, kelas, nilai, grade, kondisi };

    // 1. Simpan secara lokal
    daftarSiswa.push(dataBaru);
    renderTabel();

    // 2. Kirim data ke Server di Internet lewat API
    await simpanKeServer(daftarSiswa);

    document.getElementById("username").value = "";
    document.getElementById("nilai").value = "";
    document.getElementById("grade").innerText = "-";
    document.getElementById("kondisi").innerText = "-";

    document.getElementById("nilaiBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
}

function renderTabel() {
    let tbody = document.getElementById("tabelSiswa");
    tbody.innerHTML = "";

    daftarSiswa.forEach((siswa, index) => {
        let classKondisi = siswa.kondisi === "Lulus" ? "lulus" : "gagal";
        let row = `
            <tr>
                <td>${index + 1}</td>
                <td>${siswa.nama}</td>
                <td>${siswa.kelas}</td>
                <td>${siswa.nilai}</td>
                <td><b>${siswa.grade}</b></td>
                <td class="${classKondisi}">${siswa.kondisi}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ==============================
// FITUR EXPORT DATA KE EXCEL
// ==============================
function exportKeExcel() {
    if (daftarSiswa.length === 0) {
        alert("Belum ada data siswa untuk di-export!");
        return;
    }

    let dataExcel = daftarSiswa.map((siswa, index) => ({
        "No": index + 1,
        "Nama Siswa": siswa.nama,
        "Kelas / Jurusan": siswa.kelas,
        "Nilai": siswa.nilai,
        "Grade": siswa.grade,
        "Status": siswa.kondisi
    }));

    let worksheet = XLSX.utils.json_to_sheet(dataExcel);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa 11 RPL");

    XLSX.writeFile(workbook, "Data_Nilai_Siswa_11_RPL.xlsx");
}

function logout() {
    daftarSiswa = [];
    renderTabel();
    document.getElementById("username").value = "";
    document.getElementById("nilai").value = "";
    document.getElementById("grade").innerText = "-";
    document.getElementById("kondisi").innerText = "-";
    document.getElementById("pesan").innerText = "";
    
    document.getElementById("nilaiBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
}

function searchSong() {
    let query = document.getElementById("songInput").value.trim();
    let resultsContainer = document.getElementById("musicResults");

    if (!query) {
        resultsContainer.innerHTML = "<p style='font-size:12px; color:red;'>Ketik judul lagu terlebih dahulu!</p>";
        return;
    }

    resultsContainer.innerHTML = "<p style='font-size:12px; color:#666;'>Mencari lagu...</p>";

    let script = document.createElement('script');
    script.src = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp&callback=handleMusicResponse`;
    document.body.appendChild(script);
}

function handleMusicResponse(data) {
    let resultsContainer = document.getElementById("musicResults");
    resultsContainer.innerHTML = "";

    if (!data.data || data.data.length === 0) {
        resultsContainer.innerHTML = "<p style='font-size:12px; color:red;'>Lagu tidak ditemukan.</p>";
        return;
    }

    data.data.slice(0, 3).forEach(track => {
        let item = document.createElement("div");
        item.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px; background: #f1f1f1; border-radius: 6px; margin-bottom: 6px; cursor: pointer; text-align: left;";
        item.onclick = () => playSong(track.title, track.artist.name, track.preview);
        
        item.innerHTML = `
            <img src="${track.album.cover_small}" style="width: 32px; height: 32px; border-radius: 4px;">
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px;">
                <b>${track.title}</b><br>
                <span style="color: #666;">${track.artist.name}</span>
            </div>
        `;
        resultsContainer.appendChild(item);
    });
}

function playSong(title, artist, previewUrl) {
    document.getElementById("trackTitle").innerText = title;
    document.getElementById("trackArtist").innerText = artist;

    let audio = document.getElementById("audioPlayer");
    audio.src = previewUrl;
    
    document.getElementById("playerContainer").classList.remove("hidden");
    audio.play();
}