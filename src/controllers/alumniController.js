const sendResponse = require('../helpers/responseFormat');
const { Legalisir } = require('../db/schemas');

// POST /alumni/legalisir/create
exports.createLegalisir = async (req, res) => {
    try {
        const { username, data } = req.body;
        if (!data.nama || !data.nim) {
            return res.json({ status: "Gagal", message: "Data mahasiswa wajib diisi." });
        }
        const nomorAntrian = Math.floor(Math.random() * 100);
        const kode = `LG${nomorAntrian}`;
        const newLegalisir = new Legalisir({
            username: username || data.nama, 
            ...data,
            nomorAntrian,
            kode
        });
        await newLegalisir.save();
        sendResponse(res, true, "Legalisir berhasil dibuat", { nomorAntrian, kode }, 201);
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};

// GET /alumni/legalisir/status/:kode
exports.getLegalisirStatus = async (req, res) => {
    try {
        const item = await Legalisir.findOne({ kode: req.params.kode });
        if (item) {
            sendResponse(res, true, "Sukses", { statusLegalisir: item.status });
        } else {
            sendResponse(res, true, "Sukses", { statusLegalisir: "Tidak Ditemukan" });
        }
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};
