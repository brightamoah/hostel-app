type DashboardContext = {
  roommates: ComputedRef<Roommate[]>;
  room: ComputedRef<StudentRoom>;
  visitors: ComputedRef<StudentVisitor[]>;
};

export const dashboardKey = Symbol("dashboard") as InjectionKey<DashboardContext>;
