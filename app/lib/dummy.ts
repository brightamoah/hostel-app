import type { Visitor } from "~~/server/db/queries/visitor";

export const sampleVisitor: Visitor = {
  id: 123,
  studentId: 10000020,
  hostelId: 5,
  adminId: 10000005,
  name: "Jane Doe",
  email: "jane.visitor@example.com",
  phoneNumber: "0555551234",
  visitDate: "2025-11-20",
  relationship: "Mother",
  purpose: "Delivering documents",
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
  student: {
    user: {
      name: "Samuel King",
      email: "samuel.student@example.com",
      image: null,
    },
    allocations: [
      {
        id: 3,
        studentId: 10000004,
        roomId: 5,
        allocationDate: "2025-11-05",
        endDate: "2026-11-05",
        status: "active",
        room: {
          roomNumber: "Q103",
          building: "Queens",
          hostel: {
            name: "Queens",
          },
        },
      },
    ],
  },
  hostel: {
    name: "Vikings",
  },
  visitorLogs: [
    {
      id: 501,
      visitorId: 123,
      adminId: 10000005,
      action: "check_in",
      timestamp: new Date("2025-11-20T10:15:00Z"),
      admin: {
        user: {
          name: "Front Desk Admin",
          email: "frontdesk@example.com",
          image: null,
        },
      },
    },
  ],
  admin: {
    user: {
      name: "Front Desk Admin",
      email: "frontdesk@example.com",
      image: null,
    },
  },
} as const;

// export const sampleVisitors = [sampleVisitor] as const;
