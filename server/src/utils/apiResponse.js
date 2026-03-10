exports.success = (res, data, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

exports.error = (res, message = 'Erreur', status = 500) =>
  res.status(status).json({ success: false, message });
