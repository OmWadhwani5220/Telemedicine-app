
import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    patientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    patientName: {
      type: String,
      default: ""
    },

    doctorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Signup"
    },

    doctorName: {
      type: String,
      default: "Doctor"
    },

    encryptedData: {
      type: String,
      required: true
    },

    iv: {
      type: String,
      required: true
    },

    authTag: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

prescriptionSchema.index(
  { meetingId: 1, patientEmail: 1 },
  { unique: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
