import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { Release, ReleaseDocument } from './schemas/release.schema';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { IReleaseResponse } from './interfaces/release-response.interface';

@Injectable()
export class ReleasesService {

    constructor(
        @InjectModel(Release.name)
        private releaseModel: Model<ReleaseDocument>,
    ) { }
    
    async create(createReleaseDto: CreateReleaseDto, author: User) {
        const createdRelease = new this.releaseModel({
            ...createReleaseDto,
            author
        })
        const release = await createdRelease.save()
        return this.buildReleaseInfo(release);
    }

    async find(title: string): Promise<ReleaseDocument[] | ReleaseDocument> {
        if(title) return await this.findByTitle(title);
        return await this.findAll();
    }

    async findAll(): Promise<ReleaseDocument[]> {
        return await this.releaseModel.find();
    }

    async findOne(id: string): Promise<ReleaseDocument> {
        const release = await this.releaseModel.findById(id);
        if(!release) {
            throw new BadRequestException("This release doesn't exist");
        }
        return release;
    }

    async findByTitle(title: string): Promise<ReleaseDocument> {
        const release = await this.releaseModel.findOne({ title });
        if(!release) {
            throw new BadRequestException("A release with this title doesn't exist");
        }
        return release;
    }

    async update(id: string, updateReleaseDto: UpdateReleaseDto) {
        return `This action updates a #${id} release`;
    }

    async remove(id: string) {
        const release = await this.findOne(id);
        if (!release) {
            throw new NotFoundException('Somthing wrong with the server');
        }
        await this.releaseModel.deleteOne({ id: release._id });
        return {
            id: release._id,
            title: release.title,
            msg: 'Release deleted',
        };
    }

    private buildReleaseInfo(release: Release): IReleaseResponse {
        return {
            title: release.title,
            description: release.description,
            coverUrl: release.coverUrl,
            author: {
                id: release.author._id.toString(),
                username: release.author.username,
                email: release.author.email,
            }
        }
    }
}
