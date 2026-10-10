const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Chạy danh sách validation của express-validator.
 * Lưu ý: middleware async phải gọi next(err) thay vì throw,
 * vì Express 4 không bắt được lỗi throw trong hàm async
 * (nếu throw sẽ thành unhandledRejection và làm sập server).
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) return next();

      // Gộp các thông báo lỗi thành 1 câu dễ đọc để hiển thị trên giao diện
      const message = [...new Set(errors.array().map((err) => err.msg))].join('; ');
      return next(new ApiError(400, message));
    } catch (err) {
      return next(err);
    }
  };
};

module.exports = validate;