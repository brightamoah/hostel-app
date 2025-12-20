type DashboardContext = {
  roommates: ComputedRef<Roommate[]>;
  room: ComputedRef<StudentRoom>;
};

export const dashboardKey = Symbol("dashboard") as InjectionKey<DashboardContext>;
