/**
 * UserController — thin HTTP handlers calling UserService.
 */
const UserService = require('../services/UserService');
const apiResponse = require('../utils/apiResponse');

// POST /api/user/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, username, password } = req.body;
    await UserService.register({ name, email, username, password });
    apiResponse(res).created(null, 'Đăng ký thành công');
  } catch (err) {
    next(err);
  }
};

// GET /api/user/me
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await UserService.getProfile(req.user.id);
    apiResponse(res).success({ user: profile });
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/:userId
exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const updated = await UserService.updateUser({
      userId: req.params.userId,
      updateData,
      actorId: req.user.id,
      actorRole: req.user.role,
    });
    apiResponse(res).success({ user: updated }, 'Cập nhật thành công');
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/change-password/:userId
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await UserService.changePassword({
      targetUserId: req.params.userId,
      actorId: req.user.id,
      actorRole: req.user.role,
      oldPassword,
      newPassword,
    });
    apiResponse(res).success(null, 'Đổi mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};

// GET /api/user/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    apiResponse(res).success({ users });
  } catch (err) {
    next(err);
  }
};
