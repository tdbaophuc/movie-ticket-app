/**
 * AuthController — thin HTTP handlers calling AuthService.
 */
const AuthService = require('../services/AuthService');
const apiResponse = require('../utils/apiResponse');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, password, name, email } = req.body;
    await AuthService.register({ username, password, name, email });
    apiResponse(res).created(null, 'Đăng ký thành công');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await AuthService.login({ username, password });
    apiResponse(res).success(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);
    apiResponse(res).success(null, 'Đăng xuất thành công');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    apiResponse(res).success(result);
  } catch (err) {
    next(err);
  }
};
