import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { Hall, HallDocument } from './entities/hall.entity';
import { AppError } from 'src/common/app-error.exception';

@Injectable()
export class HallService {
  constructor(
    @InjectModel(Hall.name) private readonly hallModel: Model<HallDocument>,
  ) {}

  async AddHall(createHallDto: CreateHallDto, res: any) {
    const { hallNum } = createHallDto;

    const existingHall = await this.hallModel.findOne({ hallNum }).exec();
    if (existingHall) {
      throw new AppError('HallNum already exists 🏢❗', 400);
    }


    const newHall = new this.hallModel(createHallDto);
    const hall = await newHall.save();

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        hall,
      },
    });
  }

  async findAllHalls(res: any): Promise<void> {
    const halls = await this.hallModel.find().exec();
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        halls,
      },
    });
  }

  async findOneHall(id: string, res: any): Promise<void> {
    const hall = await this.hallModel.findById(id).exec();

    if (!hall) {
      throw new NotFoundException(`Hall not found 🏢❌`);
    }

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        hall,
      },
    });
  }

  async updateHall(id: string, updateHallDto: UpdateHallDto, res: any): Promise<void> {
    const hall = await this.hallModel.findById(id);

    if (!hall) {
      throw new NotFoundException(`Hall not found 🏢❌`);
    }

    const { hallNum } = updateHallDto;
    const existingHall = await this.hallModel.findOne({ hallNum }).exec();
    if (existingHall && existingHall.id != hall.id) {
      throw new AppError('HallNum already exists❗', 400);
    }
    
    const filteredBody = this.filterObj(updateHallDto, 'hallNum' ,'capacity', 'Imax');
  
  
    Object.keys(filteredBody).forEach(key => {
      hall[key] = filteredBody[key];
    });

    const updatedHall = await hall.save({ validateBeforeSave: false });
 
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        Hall: updatedHall,
      },
    });
  }
  


  private filterObj(obj: any, ...allowedFields: string[]) {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  }

  async removeHall(id: string, res: any): Promise<void> {
    const deletedHall = await this.hallModel.findByIdAndDelete(id).exec();

    if (!deletedHall) {
      throw new NotFoundException(`Hall not found 🏢❌`);
    }

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        hall: deletedHall,
      },
    });
  }

}
