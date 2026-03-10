const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    required: true
  },
  montant: {
    type: Number,
    required: true
  },
  methode: {
    type: String,
    enum: ['orange_money', 'manuel'],
    required: true
  },
  statut: {
    type: String,
    enum: ['pending_otp', 'pending_validation', 'validated', 'rejected'],
    default: 'pending_otp'
  },

  // ── Orange Money ──
  phoneNumber: String,
  otpSessionId: String,
  otpCode: { type: String, select: false },
  otpAttempts: { type: Number, default: 0 },
  otpExpiresAt: Date,
  otpVerifiedAt: Date,
  orangeTransactionId: String,

  // ── Paiement manuel ──
  receiptNumber: String,
  receiptImageUrl: String,
  validatedByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: Date,
  rejectionReason: String

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
