export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);
  const { db } = useDB(event);

  try {
    const isScoped = adminData.accessLevel !== "super";

    // 1. Fetch pending maintenance requests
    const pendingMaintenance = await db.query.maintenanceRequest.findMany({
      where: (table, { eq, and }) => and(
        eq(table.status, "pending"),
        isScoped ? eq(table.hostelId, adminData.hostelId!) : undefined,
      ),
      with: {
        room: true,
        student: {
          with: {
            user: true,
          },
        },
      },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 10,
    });

    // 2. Fetch pending complaints
    const pendingComplaints = await db.query.complaint.findMany({
      where: (table, { eq, and }) => and(
        eq(table.status, "pending"),
        isScoped ? eq(table.hostelId, adminData.hostelId!) : undefined,
      ),
      with: {
        student: {
          with: {
            user: true,
          },
        },
      },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 10,
    });

    // 3. Map to a unified Notification interface
    const notifications = [
      ...pendingMaintenance.map(m => ({
        id: `m-${m.id}`,
        title: "New Maintenance Request",
        message: m.room ? `Room ${m.room.roomNumber}: ${m.description}` : m.description,
        type: "maintenance" as const,
        sender: m.student.user,
        isRead: false,
        link: { name: "admin-maintenance", query: { id: m.id } },
        createdAt: m.createdAt,
      })),
      ...pendingComplaints.map(c => ({
        id: `c-${c.id}`,
        title: "New Complaint",
        message: c.description,
        type: "complaint" as const,
        sender: c.student.user,
        isRead: false,
        link: { name: "admin-complaints", query: { id: c.id } },
        createdAt: c.createdAt,
      })),
    ];

    // Sort combined notifications by newest first
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  catch (error) {
    handleError(error, "Get Notifications", event);
    return [];
  }
});
