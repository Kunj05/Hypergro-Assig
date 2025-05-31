import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface Recommendation {
  propertyId: string;
  fromUser: mongoose.Types.ObjectId;
}

export interface UserDocument extends Document {
  email: string;
  password: string;
  favorites: mongoose.Types.ObjectId[];
  recommendationsReceived: Recommendation[];
}

const recommendationSchema = new Schema<Recommendation>({
  propertyId: { type: String, required: true },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
});

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  recommendationsReceived: [recommendationSchema],
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return await bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
