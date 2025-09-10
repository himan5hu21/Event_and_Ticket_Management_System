const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.stack || err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
};

export default errorHandler;
