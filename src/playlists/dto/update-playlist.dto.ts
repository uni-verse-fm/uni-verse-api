import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum PlaylistUpdateTaskAction {
  Remove = 'REMOVE',
  Add = 'ADD',
}
export class UpdatePlaylistDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  readonly trackId?: string;

  @IsEnum(PlaylistUpdateTaskAction)
  @IsOptional()
  readonly action?: PlaylistUpdateTaskAction;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  readonly title?: string;
}
