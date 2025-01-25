export default function localStorageStore(key: string) {
  function set(value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function subscribe(run: (value: any) => void) {
    const currentValue = localStorage.getItem(key);
    if (currentValue !== null) {
      run(JSON.parse(currentValue));
    } else {
      run(null);
    }

    const eventListener = (event: StorageEvent) => {
      if (event.key === key) {
        run(JSON.parse(event.newValue!));
      }
    };
    window.addEventListener('storage', eventListener);

    return () => {
      window.removeEventListener('storage', eventListener);
    };
  }

  return { subscribe, set };
}
