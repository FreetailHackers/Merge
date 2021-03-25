export function setDefaultUserData (currentData) {
   const defaultUserData = {
      name: '[name empty]',
      school: '[missing university]',
      major: '[missing major]',
      classStanding: '[missing class standing]',
      skills: [],
      experienceLevel: '[missing experience level]',
      intro: '[missing introduction]'
   }

   for (const key in defaultUserData) {
      defaultUserData[key] = currentData[key] || defaultUserData[key];
   }

   return defaultUserData;
}
