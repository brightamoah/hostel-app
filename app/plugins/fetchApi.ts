export default defineNuxtPlugin(() => {
  const { csrf, headerName } = useCsrf();

  const apiFetch = $fetch.create({
    onRequest({ options }) {
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
