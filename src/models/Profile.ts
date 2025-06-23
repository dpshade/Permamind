export type ProfileCreateData = {
  userName: string;
  displayName?: string;
  description?: string;
  thumbnail?: string;
  coverImage?: string;
  bot?: boolean;
  website?: string;
}