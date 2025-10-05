export function useStudentData() {
  const { data, error, refresh, status } = useFetch("/api/auth/checkStudentDetails", {
    method: "GET",
    key: "student-data",
  });

  const exists = computed(() => !!data.value?.exists);

  const studentData = computed(() => data.value?.student || null);

  const handledError = computed(() => {
    if (error.value) {
      console.error("Failed to fetch student data:", error.value);
      return "Unable to load student data. Please try again.";
    }
    return null;
  });

  const pending = computed(() => status.value === "pending");

  return {
    exists,
    studentData,
    error: handledError,
    pending,
    refresh,
  };
}
