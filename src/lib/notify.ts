// SMS / email notifications. Until an SMS gateway or SMTP service is connected, they are only written to the server log.
export async function notify(to: { email?: string | null; phone?: string | null }, subject: string, message: string) {
  console.log(`[notify] to=${to.email ?? ""} ${to.phone ?? ""} | ${subject} | ${message}`);
}
