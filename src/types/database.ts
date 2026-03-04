export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          content: Json;
          content_text: string | null;
          cover_image_url: string | null;
          status: string;
          author_id: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: Json;
          content_text?: string | null;
          cover_image_url?: string | null;
          status?: string;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: Json;
          content_text?: string | null;
          cover_image_url?: string | null;
          status?: string;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
    };
  };
}
