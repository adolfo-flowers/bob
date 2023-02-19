export function asyncWait(t = 200) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1);
  });
}

const skeepCacheLsKey = 'musicInsights:skeepCache';
export const cache = {
  getItem(key) {
    const skeepCache = localStorage.getItem(skeepCacheLsKey);
    if (skeepCache) {
      console.log('Skeeping cache', key);
    }
    const record = localStorage.getItem(key);
    if (record) {
      console.log(`Got ${key} from cache`);
      return skeepCache ? false : JSON.parse(record);
    } else {
      return false;
    }
  },
  setItem(key, value) {
    return localStorage.setItem(key, JSON.stringify(value));
  },
};
