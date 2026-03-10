const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

exports.genererJWT = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.genererTokenRandom = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash  = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};
