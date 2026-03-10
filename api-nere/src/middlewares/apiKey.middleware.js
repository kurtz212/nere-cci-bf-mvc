module.exports = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== process.env.INTERNAL_API_KEY)
    return res.status(401).json({ success: false, message: 'Clé API invalide.' });
  next();
};
