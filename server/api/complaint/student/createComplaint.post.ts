export default defineEventHandler(async (event) => {
  await studentSessionCheck(event);
});
