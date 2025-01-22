export default function localStorageStore(key) {
  function set(value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function subscribe(run) {
    run(JSON.parse(localStorage.getItem(key)));

    const eventListener = (event) => {
      if (event.key === key) {
        run(JSON.parse(event.newValue));
      }
    };
    window.addEventListener('storage', eventListener);

    return () => {
      window.removeEventListener('storage', eventListener);
    };
  }

  return { subscribe, set };
}
