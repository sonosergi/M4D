export default function errorHandler(err, req, res, next) {
  // Log the error, for now just console.log
  console.log(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500);
  res.json({ error: err.message });
}