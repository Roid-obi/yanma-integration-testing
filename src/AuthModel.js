const { users } = require('./DataDummy');

class AuthModel {
    login(username, password) {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            return { success: true, message: "Login Berhasil", role: user.role, user: user };
        }
        return { success: false, message: "Username atau password salah" };
    }

    getUser(username) {
        return users.find(u => u.username === username);
    }
}

module.exports = new AuthModel();