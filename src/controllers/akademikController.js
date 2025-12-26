const sendResponse = require('../helpers/responseFormat');
const { TugasAkhir, SKL, User } = require('../db/schemas');


// POST /akademik/ta/submit
exports.submitTugasAkhir = async (req, res) => {
    try {
        const { username, data } = req.body;
        if (!data.nama || !data.nim) {
            return sendResponse(res, false, "Field wajib harus diisi");
        }
        const newTA = new TugasAkhir({ username, ...data });
        await newTA.save();
        sendResponse(res, true, "Menunggu Verifikasi", { status: "Menunggu Verifikasi" }, 201);
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};

// POST /akademik/skl/submit
exports.submitSKL = async (req, res) => {
    try {
        const { username, data } = req.body;
        const user = await User.findOne({ username });
        if (!user.lulus) {
            return sendResponse(res, false, "Belum memenuhi syarat SKL", null, 200);
        }
        if (!data.nama || !data.nim) {
            return sendResponse(res, false, "Field wajib harus diisi", null, 200);
        }
        const newSKL = new SKL({ username, ...data });
        await newSKL.save();
        sendResponse(res, true, "Menunggu Verifikasi", { status: "Menunggu Verifikasi" }, 201);
    } catch (err) {
        sendResponse(res, false, err.message, null, 500);
    }
};
