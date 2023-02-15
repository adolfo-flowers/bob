export function asyncWait(t = 200) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, t);
  });
}
