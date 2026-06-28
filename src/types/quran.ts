export interface Verse {
  number: number;
  text: string;
}

export interface Surah {
  number: number;
  name: number | string;
  englishName?: string;
  versesCount: number;
  verses: Verse[];
  revelationType: "Meccan" | "Medinan";
}

export interface Reference {
  surah: number | string;
  verses: string;
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  content?: string;
  characters: string[];
  references: Reference[];
  timelineOrder?: number;
  educationOrder?: number;
  category?: "main" | "sub";
}

export interface Ruling {
  id: string;
  title: string;
  summary: string;
  references: Reference[];
}
