const responseHandler = (req, res, next) => {
  res.success = (data = {}, message = "success", status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (message = "error", status = 400) => {
    return res.status(status).json({
      success: false,
      message,
    });
  };

  res.created = (
    data = {},
    message = "Resource created successfully",
    status = 201
  ) => {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  };

  res.badRequest = (message = "Bad Request", error = []) => {
    return res.status(400).json({
      success: false,
      message,
      error,
    });
  };

  res.unauthorized = (message = "Unauthorized") => {
    return res.status(401).json({
      success: false,
      message,
    });
  };

  res.forbidden = (message = "Forbidden") => {
    return res.status(403).json({
      success: false,
      message,
    });
  };

  res.notFound = (message = "Resource not found") => {
    return res.status(404).json({
      success: false,
      message,
    });
  };

  res.serverError = (message = "Internal Server Error") => {
    return res.status(500).json({
      success: false,
      message,
    });
  };

  res.noContent = () => {
    return res.status(204).send();
  };

  next();
};

export default responseHandler;
