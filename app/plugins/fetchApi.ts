export default defineNuxtPlugin(() => {
  const apiFetch = $fetch.create({
    onRequest({ options }) {
      const { csrf, headerName } = useCsrf();
      options.headers = new Headers(options.headers || {});
      options.headers.append(headerName, csrf);
    },
  });

  return {
    provide: {
      apiFetch,
    },
  };
});
