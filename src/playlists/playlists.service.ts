import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TracksService } from '../tracks/tracks.service';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist, PlaylistDocument } from './schemas/playlist.schema';

@Injectable()
export class PlaylistsService {

    constructor(
        @InjectModel(Playlist.name)
        private playlistModel: Model<PlaylistDocument>,
        private tracksService: TracksService,
        private usersService: UsersService,
    ) { }


    async createPlaylist(
        createPlaylistDto: CreatePlaylistDto,
        owner: UserDocument,
    ): Promise<PlaylistDocument> {
        this.isPlaylistUnique(createPlaylistDto.title);

        const createPlaylist = {
            ...createPlaylistDto,
            owner
        }

        const playlist = new this.playlistModel(createPlaylist);

        return playlist.save();
    }

    async findAllPlaylists(): Promise<PlaylistDocument[]> {
        return this.playlistModel.find();
    }

    async findPlaylsitById(id: string): Promise<PlaylistDocument> {
        const playlist = await this.playlistModel.findById(id);
        if (!playlist) {
            throw new NotFoundException(`Playlist with ID "${id}" not found.`);
        }
        return playlist;
    }

    async findPlaylsitByTitle(title: string): Promise<PlaylistDocument> {
        const playlist = await this.playlistModel.findOne({ title });
        if (!playlist) {
            throw new NotFoundException(`Playlist with title ${title} not found.`);
        }
        return playlist;
    }

    update(id: string, updatePlaylistDto: UpdatePlaylistDto) {
        return `This action updates a #${id} playlist`;
    }

    remove(id: string) {
        return `This action removes a #${id} playlist`;
    }

    private async isPlaylistUnique(title: string) {
        let playlist: PlaylistDocument;
        try {
            playlist = await this.playlistModel.findOne({ title });
        } catch (error) {
            throw new Error('Somthing went wrong.');
        }
        if (playlist?.title === title) {
            throw new BadRequestException('Playlist must be unique.');
        }
    }
}
