export default function localStorageStore(key) {
  function set(value) {
    localStorage.setItem(key, value);
  }

  function subscribe(run) {
    run(localStorage.getItem(key));

    const eventListener = (event) => {
      if (event.key === key) {
        run(event.newValue);
      }
    };
    window.addEventListener('storage', eventListener);

    return () => {
      window.removeEventListener('storage', eventListener);
    };
  }

  return { subscribe, set };
}
