export default () => {
  const min = 0;
  const max = 100;

  return Math.floor(Math.random() * (max - min)) + min;
};
