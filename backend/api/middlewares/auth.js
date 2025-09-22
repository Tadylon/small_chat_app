// 认证中间件
const auth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = { id: req.session.userId };
    return next();
  } else {
    return res.status(401).json({
      status: 'error',
      message: '未登录，请先登录'
    });
  }
};

module.exports = auth;