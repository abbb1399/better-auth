import { sendEmail } from "./send-email";

interface EmailVerificationData {
  user: {
    name: string;
    email: string;
  };
  url: string;
}

export async function sendEmailVerificationEmail({
  user,
  url,
}: EmailVerificationData) {
  await sendEmail({
    to: user.email,
    subject: "이메일 주소 인증",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">이메일 인증</h2>
        <p>${user.name}님, 안녕하세요.</p>
        <p>회원가입해 주셔서 감사합니다! 아래 버튼을 클릭하여 이메일 주소를 인증해 주세요.</p>
        <a href="${url}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">이메일 인증하기</a>
        <p>본인이 가입하지 않으셨다면 이 이메일을 무시하셔도 됩니다.</p>
        <p>이 링크는 24시간 후에 만료됩니다.</p>
        <p>감사합니다.<br>서비스 팀 드림</p>
      </div>
    `,
    text: `${user.name}님, 안녕하세요.\n\n회원가입해 주셔서 감사합니다! 아래 링크를 클릭하여 이메일 주소를 인증해 주세요: ${url}\n\n본인이 가입하지 않으셨다면 이 이메일을 무시하셔도 됩니다.\n\n이 링크는 24시간 후에 만료됩니다.\n\n감사합니다.\n서비스 팀 드림`,
  });
}
