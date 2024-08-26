import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import slugify from 'slugify';

export type FilmDocument = Film & Document;

@Schema({
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Film extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  ratingsAverage: number;

  @Prop()
  ratingsQuantity: number;

  @Prop()
  description: string;

  @Prop()
  poster: string;

  // Use a getter to append 'min' to the duration value
  @Prop({ required: true, get: (duration: number) => `${duration} min + 15 min break` })
  duration: number;

  @Prop()
  genre: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ type: Date })
  releaseDate: Date;

  @Prop({ type: Date })
  removeDate: Date;

  @Prop()
  totalAudience: number;

  @Prop()
  totalRevenue: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hall' }],
  })
  hall: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: ['2D', '3D'],
    default: '2D',
  })
  type: string;

  @Prop()
  cast: [string];
}

const FilmSchema = SchemaFactory.createForClass(Film);

FilmSchema.index({ slug: 1 });
FilmSchema.index({ genre: 1, ratingsAverage: -1 });
FilmSchema.index({ title: 1 });

// Document middleware: Runs before .save() and .create()
FilmSchema.pre<Film>('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Query middleware: Runs before find() queries
// FilmSchema.pre(/^find/, function (this: mongoose.Query<any, Film>, next) {
//   this.populate({
//     path: 'hall',
//     select: 'hallNum Imax',
//   });
//   next();
// });

export { FilmSchema };
