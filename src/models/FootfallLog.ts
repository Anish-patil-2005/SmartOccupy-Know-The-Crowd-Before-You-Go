import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFootfallLog extends Document {
  storeId: mongoose.Types.ObjectId;
  action: 'entry' | 'exit';
  timestamp: Date; // The most important field for analytics
}

const FootfallLogSchema: Schema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  action: { type: String, enum: ['entry', 'exit'], required: true },
  timestamp: { type: Date, default: Date.now },
});

const FootfallLog: Model<IFootfallLog> = mongoose.models.FootfallLog || mongoose.model<IFootfallLog>('FootfallLog', FootfallLogSchema);

export default FootfallLog;