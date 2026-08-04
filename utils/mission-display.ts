import type { CurriculumContentType, MissionKind } from '../data/curriculum/types';

const DECORATIVE_TITLE_SUFFIXES = [
  '👨‍👩‍👧', '☀️', '✅', '🏠', '🔑', '👕', '🧺', '🚪',
  '👋', '😊', '☕', '🎨', '🔢', '📍',
] as const;

export type MissionIconKey =
  | 'book-open'
  | 'circle-check'
  | 'circle-help'
  | 'coffee'
  | 'door-open'
  | 'hand-helping'
  | 'hash'
  | 'heart'
  | 'home'
  | 'key'
  | 'list-checks'
  | 'map-pin'
  | 'messages-square'
  | 'package'
  | 'palette'
  | 'shirt'
  | 'smile'
  | 'sparkles'
  | 'sun'
  | 'trophy'
  | 'user'
  | 'users';

export function getMissionDisplayTitle(canonicalTitle: string) {
  let displayTitle = canonicalTitle.trimEnd();
  let removedSuffix = true;
  while (removedSuffix) {
    removedSuffix = false;
    for (const suffix of DECORATIVE_TITLE_SUFFIXES) {
      if (displayTitle.endsWith(suffix)) {
        displayTitle = displayTitle.slice(0, -suffix.length).trimEnd();
        removedSuffix = true;
        break;
      }
    }
  }
  return displayTitle;
}

export function hasUnsafeMissionTitleGlyph(title: string) {
  return /[\uFFFD\u25A1\u25A0\u25A3\u25A4\u25A5\u25A6\u25A7\u25A8\u25A9]/u.test(title);
}

export function getMissionIconKey(item: {
  contentId: string;
  contentType?: CurriculumContentType;
  missionKind?: MissionKind;
}): MissionIconKey {
  if (item.missionKind === 'review' || item.contentId === 'big_review') return 'circle-help';
  if (item.missionKind === 'guided_dialogue') return 'messages-square';
  if (item.missionKind === 'challenge' || item.contentId.includes('challenge')) return 'trophy';

  switch (item.contentId) {
    case 'first_arabic_words': return 'sparkles';
    case 'polite_like_a_local': return 'smile';
    case 'people_around_you': return 'users';
    case 'everyday_objects': return 'package';
    case 'food_and_drinks': return 'coffee';
    case 'describe_the_world': return 'palette';
    case 'numbers_and_money': return 'hash';
    case 'where_here_there': return 'map-pin';
    case 'introduce_yourself': return 'user';
    case 'how_are_you': return 'heart';
    case 'around_the_home': return 'home';
    case 'where_are_my_things': return 'key';
    case 'simple_actions_at_home': return 'hand-helping';
    case 'getting_dressed': return 'shirt';
    case 'today_now_later': return 'sun';
    case 'ready_or_missing': return 'circle-check';
    case 'what_do_you_like': return 'heart';
    case 'helping_at_home': return 'package';
    case 'leaving_and_coming_back': return 'door-open';
    case 'put_the_steps_together': return 'list-checks';
    default: return 'book-open';
  }
}
