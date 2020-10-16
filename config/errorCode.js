const errorCode = {
  200: {
    code: 200,
    message: "Success",
  },
  201: { code: 201, message: "Create success" },
  400: { code: 400, message: "Bad Request" },
  401: {
    code: 401,
    message: "Full authentication is required to access this resource",
  },
  403: {
    code: 403,
    message: "Forbidden: You don't have permission to access on this server",
  },
  404: { code: 404, message: "Not Found" },
  405: { code: 405, message: "Method Not Allowed" },
  422: { code: 422, message: "Unprocessable Entity" },
  500: { code: 500, message: "Internal Server Error" },
  415: { code: 415, message: "Content type not supported" },
};

module.exports = errorCode;
