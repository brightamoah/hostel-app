/* eslint-disable no-console */
export default defineTask({
  meta: {
    name: "scheduler",
    description: "Runs scheduled tasks at specified intervals",
  },

  async run() {
    console.log("Running scheduled tasks...");

    await runTask("clearExpiredCache");
    await runTask("checkOverdueBillings");
    await runTask("cancelUnpaidAllocations");

    // Weekly task
    const now = new Date();
    const isSunday = now.getUTCDay() === 0;
    const is1am = now.getUTCHours() === 1;

    if (isSunday && is1am) {
      await runTask("applyOverdueLateFee");
    }

    return { result: "Scheduled tasks executed successfully." };
  },
});
