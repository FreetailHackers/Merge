const howLongAgo = (date) => {
  const millisecondDifference = new Date() - new Date(date);
  if (millisecondDifference < 1000) {
    return "< 1s";
  }

  const secondDifference = millisecondDifference / 1000;
  if (secondDifference < 60) {
    return Math.floor(secondDifference) + "s";
  }

  const minuteDifference = secondDifference / 60;
  if (minuteDifference < 60) {
    return Math.floor(minuteDifference) + "m";
  }

  const hourDifference = minuteDifference / 60;
  if (hourDifference < 24) {
    return Math.floor(hourDifference) + "h";
  }

  const dayDifference = hourDifference / 24;
  return Math.floor(dayDifference) + "d";
};

export default howLongAgo;
