import { WorkerMailer } from "worker-mailer";

export async function useWorkerMailer() {
  const runtimeConfig = useRuntimeConfig();

  const mailer = await WorkerMailer.connect({
    credentials: {
      username: runtimeConfig.nodemailerAuthUser,
      password: runtimeConfig.nodemailerAuthPass,
    },
    authType: "plain",
    host: runtimeConfig.nodemailerHost,
    port: runtimeConfig.nodemailerPort,
    secure: true,
  });

  return mailer;
}
