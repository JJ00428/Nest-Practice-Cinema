import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Seat {
  @Prop({ required: true })
  seatNum: string;

  @Prop({ default: false })
  isReserved: boolean;
}

@Schema()
export class ShowtimeSeats extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Film', required: true })
  film: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true })
  hall: mongoose.Types.ObjectId;

  @Prop({ required: true })
  showtime: Date;

  @Prop({ type: [Seat], default: [] })
  seats: Seat[];
}

const ShowtimeSeatsSchema = SchemaFactory.createForClass(ShowtimeSeats);

ShowtimeSeatsSchema.index({ showtime: 1 });
ShowtimeSeatsSchema.index({ 'seats.seatNum': 1 });
ShowtimeSeatsSchema.index({ hall: 1, film: 1, showtime: 1, 'seats.seatNum': 1 }, { unique: true });

// Query middleware: Runs before find() queries
ShowtimeSeatsSchema.pre(
  /^find/,
  function (this: mongoose.Query<any, ShowtimeSeats>, next) {
    this.populate({
      path: 'hall',
      select: 'hallNum',
    });
    next();
  },
);

ShowtimeSeatsSchema.pre(
  /^find/,
  function (this: mongoose.Query<any, ShowtimeSeats>, next) {
    this.populate({
      path: 'film',
      select: 'title',
    });
    next();
  },
);

export { ShowtimeSeatsSchema };
