import { SETTINGS, CHARACTERS, ACTIVITIES, LOCATIONS } from '@/constants';

const getRandomElement = (arr: string[]): string =>
  arr[Math.floor(Math.random() * arr.length)];

export const getRandomSetting = () => getRandomElement(SETTINGS);
export const getRandomCharacter = () => getRandomElement(CHARACTERS);
export const getRandomActivity = () => getRandomElement(ACTIVITIES);
export const getRandomLocation = () => getRandomElement(LOCATIONS);

export const getRandomDescription = (): string => {
  const randomSetting = getRandomSetting();
  const randomCharacter = getRandomCharacter();
  const randomActivity = getRandomActivity();
  const randomLocation = getRandomLocation();

  return `A ${randomSetting} scene with ${randomCharacter} ${randomActivity} in ${randomLocation}.`;
};
