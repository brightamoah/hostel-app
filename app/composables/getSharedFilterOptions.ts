export function useGetSharedFilterOptions() {
  const { user } = useUserSession();

  const studentFilter = ref("");
  const studentFilterOptions = ref<FilterOption[]>([]);
  const isStudentLoading = ref(false);

  if (user.value?.role === "admin") {
    const { users, status } = useFetchUserData();

    const studentFilterOptionsGetter = computed<FilterOption[]>(() => {
      const students = users.value.filter(user => user.role === "student");

      const filter = students.map(student => ({
        label: student.name,
        value: student.name,
      }));
      return [
        {
          label: "All Students",
          value: "all",
        },
        ...filter,
      ];
    });

    isStudentLoading.value = status.value === "pending";

    studentFilterOptions.value = studentFilterOptionsGetter.value;
  }

  const hostelFilter = ref("");
  const isHostelLoading = ref(false);
  const hostelFilterOptions = ref<FilterOption[]>([]);
  if (user.value?.role === "admin") {
    const { hostels, status } = useFetchRoomData();
    const hostelFilterOptionsGetter = computed(() => {
      const raw = (hostels.value?.map(
        hostel => hostel.name,
      ) ?? []) as string[];

      const options = raw.map(name => ({
        label: name,
        value: name,
      }));
      return [{ label: "All Hostels", value: "all" }, ...options];
    });

    isHostelLoading.value = status.value === "pending";
    hostelFilterOptions.value = hostelFilterOptionsGetter.value;
  }

  return {
    studentFilter,
    studentFilterOptions,
    hostelFilter,
    hostelFilterOptions,
    isStudentLoading,
    isHostelLoading,
  };
}
