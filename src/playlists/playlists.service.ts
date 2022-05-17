import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track } from '../tracks/schemas/track.schema';
import { TracksService } from '../tracks/tracks.service';
import { UserDocument } from '../users/schemas/user.schema';
import { isValidId } from '../utils/is-valid-id';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import {
  PlaylistUpdateTaskAction,
  UpdatePlaylistDto,
} from './dto/update-playlist.dto';
import { Playlist, PlaylistDocument } from './schemas/playlist.schema';

@Injectable()
export class PlaylistsService {
  private readonly logger: Logger = new Logger(PlaylistsService.name);

  constructor(
    @InjectModel(Playlist.name)
    private playlistModel: Model<PlaylistDocument>,
    private tracksService: TracksService,
  ) {}

  async createPlaylist(
    createPlaylistDto: CreatePlaylistDto,
    owner: UserDocument,
  ): Promise<PlaylistDocument> {
    this.logger.log(`Creating playlist ${createPlaylistDto.title}`);
    this.isPlaylistUnique(createPlaylistDto.title);

    const createPlaylist = {
      ...createPlaylistDto,
      owner,
      tracks: [],
    };

    const playlist = new this.playlistModel(createPlaylist);

    const savedPlaylist = await playlist.save();
    return savedPlaylist;
  }

  async find(title: string): Promise<PlaylistDocument[] | PlaylistDocument> {
    this.logger.log(`finding for playlist ${title}`);
    if (title) return await this.findPlaylsitByTitle(title);
    return await this.findAllPlaylists();
  }

  async findAllPlaylists(): Promise<PlaylistDocument[]> {
    this.logger.log('finding all playlists');
    return await this.playlistModel.find();
  }

  async findPlaylistById(id: string): Promise<PlaylistDocument> {
    this.logger.log(`finding playlist by id ${id}`);
    isValidId(id);
    const playlist = await this.playlistModel.findById(id);
    if (!playlist) {
      throw new NotFoundException(`Playlist with ID "${id}" not found.`);
    }
    return playlist;
  }

  async findPlaylsitByTitle(title: string): Promise<PlaylistDocument> {
    this.logger.log(`finding playlist by title ${title}`);
    const playlist = await this.playlistModel.findOne({ title });
    if (!playlist) {
      throw new NotFoundException(`Playlist with title ${title} not found.`);
    }
    return playlist;
  }

  async updatePlaylist(
    id: string,
    updatePlaylistDto: UpdatePlaylistDto,
    owner: UserDocument,
  ) {
    this.logger.log(`updating playlist ${id}`);
    isValidId(id);
    const playlist = await this.isUserTheOwnerOfPlaylist(id, owner);

    const trackId = updatePlaylistDto.trackId;
    const playlistTracks = playlist.tracks;

    const trackToUpdate = await this.tracksService.findTrackById(
      updatePlaylistDto.trackId,
    );
    if (!trackToUpdate) {
      throw new NotFoundException(
        this.logger.error(`track with ID "${trackId}" not found.`),
        `Track with ID "${trackToUpdate}" not found.`,
      );
    }

    let newTracks: Track[];
    switch (updatePlaylistDto.action) {
      case PlaylistUpdateTaskAction.Add:
        this.logger.log(`adding track ${trackId} to playlist ${id}`);
        newTracks = [...playlistTracks, trackToUpdate];
        break;
      case PlaylistUpdateTaskAction.Remove:
        this.logger.log(`removing track ${trackId} from playlist ${id}`);
        newTracks = playlistTracks.filter(
          (track) => track._id.toString() !== trackId,
        );
        break;
      default:
        throw new BadRequestException('Action not found.');
    }

    const updatePlaylist = {
      title: updatePlaylistDto.title || playlist.title,
      tracks: newTracks,
    };
    await this.playlistModel.updateOne({ id: playlist._id }, updatePlaylist);

    return {
      id: playlist._id.toString(),
      title: playlist.title,
      msg: 'Playlist updated',
    };
  }

  async removePlaylist(id: string, owner: UserDocument) {
    this.logger.log(`removing playlist ${id}`);
    isValidId(id);
    const playlist = await this.isUserTheOwnerOfPlaylist(id, owner);

    try {
      await playlist.remove();
    } catch (error) {
      this.logger.error(`can not remove playlist ${id} due to: ${error}`);
      throw new Error("Can't delete playlist");
    }

    return {
      id: playlist._id.toString(),
      title: playlist.title,
      msg: 'Playlist deleted',
    };
  }

  private async isUserTheOwnerOfPlaylist(id: string, owner: UserDocument) {
    this.logger.log(
      `checking if user ${owner.id} is the owner of playlist ${id}`,
    );
    const playlist = await this.findPlaylistById(id);
    if (!playlist) {
      this.logger.error(`playlist with ID "${id}" not found.`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    if (playlist.owner._id.toString() !== owner._id.toString()) {
      this.logger.error(`user ${owner.id} is not the owner of playlist ${id}`);
      throw new BadRequestException('You are not the owner of this playlist.');
    }
    return playlist;
  }

  private async isPlaylistUnique(title: string) {
    this.logger.log(`checking if playlist ${title} is unique`);
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
