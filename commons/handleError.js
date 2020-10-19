const handleError = (res, error = "Xảy ra lỗi") => {
  return res.status(400).json({ msg: error });
};
export default handleError;
