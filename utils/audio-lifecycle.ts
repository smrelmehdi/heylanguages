export type AudioPlaybackOwner = Readonly<{
  id: number;
  label: string;
}>;

let nextOwnerId = 1;

export function createAudioPlaybackOwner(label: string): AudioPlaybackOwner {
  return { id: nextOwnerId++, label };
}

export class AudioPlaybackLifecycle {
  private token = 0;
  private owner: AudioPlaybackOwner | null = null;

  begin(owner: AudioPlaybackOwner | null): number {
    this.token += 1;
    this.owner = owner;
    return this.token;
  }

  isCurrent(token: number): boolean {
    return token === this.token;
  }

  stop(owner?: AudioPlaybackOwner): boolean {
    if (owner && this.owner?.id !== owner.id) return false;
    this.token += 1;
    this.owner = null;
    return true;
  }

  finish(token: number): boolean {
    if (!this.isCurrent(token)) return false;
    this.owner = null;
    return true;
  }

  snapshot() {
    return { token: this.token, owner: this.owner };
  }
}
