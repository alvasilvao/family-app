export interface Env {
  APP_URL: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const url = `${env.APP_URL}/api/notifications/send?key=${env.CRON_SECRET}`;

    ctx.waitUntil(
      fetch(url, { method: "POST" })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            console.log("Notifications sent:", JSON.stringify(data));
          } else {
            console.error(`Failed to send notifications: ${res.status} ${await res.text()}`);
          }
        })
        .catch((err) => {
          console.error("Error calling notifications endpoint:", err);
        }),
    );
  },
};
