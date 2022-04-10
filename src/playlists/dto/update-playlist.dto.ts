import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CreatePlaylistDto } from './create-playlist.dto';

export enum PlaylistUpdateTaskAction {
    Remove = 'REMOVE',
    Add = 'ADD',
}
export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(50)
    readonly trackId: string;

    @IsEnum(PlaylistUpdateTaskAction)
    @IsOptional()
    readonly action?: PlaylistUpdateTaskAction;
}
