export class Song {
    title = '';
    releaseDate = '';
    audioUrl = '';
    audioPath = '';
    imageUrl = '';
    imagePath = '';
    songType: number;
    isLoading = true;
}

export enum SongType {
    Normal = 0,
    Instrumental = 1,
    BackgroundVocals = 2,
    Other = 3
}
