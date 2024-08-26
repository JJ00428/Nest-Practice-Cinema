import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type HallDocument = Hall & Document;

@Schema({
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
})
export class Hall extends Document {
  @Prop({ required: true , unique: true })
  hallNum: number;

  @Prop()
  capacity: number;

  @Prop({ required: true })
  Imax: boolean;

  @Prop({ required: true })
  price: number;
}

const HallSchema = SchemaFactory.createForClass(Hall);

export { HallSchema };
