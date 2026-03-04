import { sendEmail } from "./send-email";

export async function sendOrganizationInviteEmail({
  invitation,
  inviter,
  organization,
  email,
}: {
  invitation: { id: string };
  inviter: { name: string };
  organization: { name: string };
  email: string;
}) {
  await sendEmail({
    to: email,
    subject: `${organization.name} 조직에 초대되었습니다`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${organization.name} 조직에 초대되었습니다</h2>
        <p>안녕하세요,</p>
        <p>${inviter.name}님이 ${organization.name} 조직에 초대했습니다. 아래 버튼을 클릭하여 초대를 수락하거나 거절하세요:</p>
        <a href="${process.env.BETTER_AUTH_URL}/organizations/invites/${invitation.id}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">초대 관리</a>
        <p>감사합니다,<br>앱 팀 드림</p>
      </div>
    `,
    text: `${organization.name} 조직에 초대되었습니다\n\n안녕하세요,\n\n${inviter.name}님이 ${organization.name} 조직에 초대했습니다. 아래 링크를 클릭하여 초대를 수락하거나 거절하세요:\n\n${process.env.BETTER_AUTH_URL}/organizations/invites/${invitation.id}\n\n감사합니다,\n앱 팀 드림`,
  });
}
