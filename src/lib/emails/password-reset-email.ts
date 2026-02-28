import { sendEmail } from "./send-email";

export function sendPasswordResetEmail({
  user,
  url,
}: {
  user: { email: string; name: string };
  url: string;
}) {
  return sendEmail({
    to: user.email,
    subject: "비밀번호를 재설정해 주세요",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">비밀번호 재설정</h2>
        <p>${user.name}님, 안녕하세요.</p>
        <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 비밀번호를 재설정해 주세요:</p>
        <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">비밀번호 재설정</a>
        <p>본인이 요청하지 않으셨다면 이 이메일을 무시해 주세요.</p>
        <p>이 링크는 24시간 후 만료됩니다.</p>
        <p>감사합니다,<br>앱 팀 드림</p>
      </div>
    `,
    text: `${user.name}님, 안녕하세요.\n\n비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 비밀번호를 재설정해 주세요: ${url}\n\n본인이 요청하지 않으셨다면 이 이메일을 무시해 주세요.\n\n이 링크는 24시간 후 만료됩니다.\n\n감사합니다,\n앱 팀 드림`,
  });
}
