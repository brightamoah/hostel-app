import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

import { useDateFormat } from "@vueuse/core";

import type { RowActionItem } from "~/types/rowAction";

const BillingDetails = defineAsyncComponent(() => import("~/components/billing/details.vue"));

export function useBillingRowColumn(
  UAvatar: ComponentType,
  UButton: ComponentType,
  UBadge: ComponentType,
  UDropdownMenu: ComponentType,
) {
  const { user } = useUserSession();
  const overlay = useOverlay();

  const openBillingDetails = (billing: Billing) => {
    const modal = overlay.create(BillingDetails);

    modal.open({
      billing,
    });
  };

  const getRowItems = (row: Row<Billing>) => {
    const billing = row.original;

    const actions: RowActionItem[] = [
      {
        type: "label",
        label: "Actions",
      },
      {
        label: "View Details",
        icon: "i-lucide-eye",
        onSelect: () => openBillingDetails(billing),
      },
    ];

    if (user.value?.role === "admin") {
      actions.push(
        {
          label: "Send Reminder",
          icon: "i-lucide-mail",
          onSelect: () => { },
        },
        {
          label: "Record Payment",
          icon: "lucide-banknote-arrow-up",
          onSelect: () => { },
        },
      );
    }

    if (user.value?.role === "student" && ["unpaid", "partially paid"]
      .some(status => billing.status.toLowerCase().includes(status))) {
      actions.push(
        {
          label: "Make Payment",
          icon: "lucide-credit-card",
          color: "primary",
          onSelect: () => { },
        },
      );
    }

    return actions;
  };

  const columns = computed(() => {
    const cols: TableColumn<Billing>[] = [
      {
        id: "invoiceNumber",
        accessorFn: row => row.invoiceNumber,
        header: createSortableHeader("Invoice No.", UButton),
        cell: ({ row }) => h("p", { class: "capitalize text-default" }, row.original.invoiceNumber),
      },
    ];

    if (user.value?.role === "admin") {
      cols.push(
        {
          id: "student",
          accessorFn: (row) => {
            const student = row.student;
            if (!student) return "N/A";
            return `${student.user.name} ${student.user.email}`;
          },
          header: createSortableHeader("Student", UButton),
          cell: ({ row }) => {
            const student = row.original.student;

            if (!student) return h("span", "N/A");

            return h("div", { class: "flex items-center gap-3" }, [
              h(UAvatar, {
                src: student.user.image,
                text: generateInitials(student.user.name),
                alt: student.user.name,
                class: "w-8 h-8 rounded-full object-cover",
                size: "lg",
                style: `background-color: ${generateUserColor(student.userId)}`,
                ui: { fallback: "text-white" },
              }),
              h("div", undefined, [
                h("p", { class: "font-medium text-highlighted" }, student.user.name),
                h("p", { class: "" }, `${student.user.email}`),
              ]),
            ]);
          },
          filterFn: "includesString",
        },
      );
    }

    cols.push(
      {
        id: "amount",
        accessorFn: row => row.amount,
        header: createSortableHeader("Amount", UButton),
        cell: ({ row }) => {
          return h("p", { class: "font-medium" }, `${formatCurrency(Number(row.original.amount))}`);
        },
      },
      {
        id: "dateIssued",
        accessorFn: row => useDateFormat(row.dateIssued, "ddd DD-MM-YYYY").value,
        header: createSortableHeader("Date Issued", UButton),
        cell: ({ row }) => h("span", { class: "text-default" }, useDateFormat(new Date(row.original.dateIssued), "ddd DD-MM-YYYY").value),
      },
      {
        id: "dueDate",
        accessorFn: row => useDateFormat(row.dueDate, "ddd DD-MM-YYYY").value,
        header: createSortableHeader("Due Date", UButton),
        cell: ({ row }) => h("span", { class: "text-default" }, useDateFormat(new Date(row.original.dueDate), "ddd DD-MM-YYYY").value),
      },
      {
        accessorKey: "status",
        header: createSortableHeader("Status", UButton),
        cell: ({ row }) => {
          return h(UBadge, {
            label: row.original.status.replace("-", " "),
            color: billingStatusColorMap[row.original.status],
            variant: "subtle",
            class: "capitalize",
          });
        },
      },
      {
        id: "paidAmount",
        header: createSortableHeader("Paid", UButton),
        cell: ({ row }) => {
          return h("p", { class: "font-medium" }, `${formatCurrency(Number(row.original.paidAmount))}`);
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          h(
            "div",
            { class: "text-center" },
            [
              h(UDropdownMenu, {
                arrow: true,
                content: {
                  align: "center",
                },
                items: getRowItems(row),
                ui: {
                  item: "cursor-pointer rounded",
                },
              }, () =>
                h(UButton, {
                  icon: "i-lucide-ellipsis-vertical",
                  color: "neutral",
                  variant: "ghost",
                  class: "ml-auto cursor-pointer",
                })),
            ],
          ),
      },

    );

    return cols;
  });

  return {
    getRowItems,
    columns,
  };
}
