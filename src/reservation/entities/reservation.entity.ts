import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Reservation extends Document {
  @Prop({
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  })
  user: mongoose.Types.ObjectId;

  @Prop({
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'Film' },
  })
  film: mongoose.Types.ObjectId;


  @Prop()
  seats: [string];

  @Prop({
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
  })
  hall: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true })
  showtime: Date;

  @Prop({ get: (totalPrice: number) => `${totalPrice} $` })
  totalPrice: number;

  @Prop()
  glasses: boolean;

  @Prop({default: Date.now()})
  createdAt: Date;

}

const ReservationSchema = SchemaFactory.createForClass(Reservation);

ReservationSchema.index({ user: 1 , createdAt: -1});


ReservationSchema.pre(/^find/, function (this: mongoose.Query<any, Reservation>, next) {
  this.populate({
    path: 'user',
    select: 'username',
  });
  next();
});

ReservationSchema.pre(/^find/, function (this: mongoose.Query<any, Reservation>, next) {
  this.populate({
    path: 'hall',
    select: 'hallNum Imax',
  });
  next();
});

export { ReservationSchema };
