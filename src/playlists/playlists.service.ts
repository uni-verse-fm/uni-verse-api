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
import PlaylistsSearchService from './playlists-search.service';
import { Playlist, PlaylistDocument } from './schemas/playlist.schema';

@Injectable()
export class PlaylistsService {
  private readonly logger: Logger = new Logger(PlaylistsService.name);

  constructor(
    @InjectModel(Playlist.name)
    private playlistModel: Model<PlaylistDocument>,
    private tracksService: TracksService,
    private playlistsSearchService: PlaylistsSearchService,
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
    this.logger.log(`Finding for playlist ${title}`);
    if (title) return await this.findPlaylsitByTitle(title);
    return await this.findAllPlaylists();
  }

  async findAllPlaylists(): Promise<PlaylistDocument[]> {
    this.logger.log('Finding all playlists');
    return await this.playlistModel.find();
  }

  async findPlaylistById(id: string): Promise<PlaylistDocument> {
    this.logger.log(`Finding playlist by id ${id}`);
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
    this.logger.log(`Updating playlist ${id}`);
    isValidId(id);
    const playlist = await this.isUserTheOwnerOfPlaylist(id, owner);
    const trackToUpdate =
      updatePlaylistDto.trackId &&
      (await this.tracksService.findTrackById(updatePlaylistDto.trackId));

    let body = {
      title: playlist.title,
      tracks: playlist.tracks,
    };

    if (updatePlaylistDto.title)
      body = { ...body, title: updatePlaylistDto.title };

    if (trackToUpdate) {
      const newTracks = this.updatedTracks(
        updatePlaylistDto.action,
        playlist.tracks,
        trackToUpdate,
        id,
      );
      body = { ...body, tracks: newTracks };
    }

    return await this.playlistModel
      .updateOne({ id: playlist._id }, body)
      .then(() => ({
        id: playlist._id.toString(),
        msg: 'Playlist updated',
      }));
  }

  private updatedTracks(
    action: PlaylistUpdateTaskAction,
    tracks: Track[],
    trackToUpdate: Track,
    playlistId: string,
  ): Track[] {
    switch (action) {
      case PlaylistUpdateTaskAction.Add:
        this.logger.log(
          `Adding track ${trackToUpdate._id} to playlist ${playlistId}`,
        );
        return [...tracks, trackToUpdate];
      case PlaylistUpdateTaskAction.Remove:
        this.logger.log(
          `Removing track ${trackToUpdate._id} from playlist ${playlistId}`,
        );
        return tracks.filter(
          (track) => track._id.toString() !== trackToUpdate._id.toString(),
        );
      default:
        throw new BadRequestException('Action not found.');
    }
  }

  async removePlaylist(id: string, owner: UserDocument) {
    this.logger.log(`Cemoving playlist ${id}`);
    isValidId(id);
    const playlist = await this.isUserTheOwnerOfPlaylist(id, owner);

    try {
      await playlist.remove();
    } catch (error) {
      this.logger.error(`Can not remove playlist ${id} due to: ${error}`);
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
      `Checking if user ${owner.id} is the owner of playlist ${id}`,
    );
    const playlist = await this.findPlaylistById(id);
    if (!playlist) {
      this.logger.error(`Playlist with ID "${id}" not found.`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    if (playlist.owner._id.toString() !== owner._id.toString()) {
      this.logger.error(`User ${owner.id} is not the owner of playlist ${id}`);
      throw new BadRequestException('You are not the owner of this playlist.');
    }
    return playlist;
  }

  private async isPlaylistUnique(title: string) {
    this.logger.log(`Checking if playlist ${title} is unique`);
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

  async searchPlaylist(search: string) {
    const results = await this.playlistsSearchService.searchIndex(search);
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return [];
    }
    return this.playlistModel
      .find({
        _id: {
          $in: ids,
        },
      })
      .populate('tracks')
      .populate({
        path: 'tracks',
        populate: {
          path: 'author',
        },
      })
      .populate({
        path: 'tracks',
        populate: {
          path: 'feats',
        },
      })
      .populate('owner');
  }
}
