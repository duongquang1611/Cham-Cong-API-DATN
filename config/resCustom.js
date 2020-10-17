const resCustom = (code, res, data) => {
  return res.status(code).json(data);
};
module.exports = resCustom;
