import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const position = formData.get("position") as string;
    const message = formData.get("message") as string;
    const portfolio = formData.get("portfolio") as File | null;

    const oAuth2Client = new google.auth.OAuth2(process.env.EMAIL_ID, process.env.EMAIL_SECRET);

    // oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const accessToken = await oAuth2Client.getAccessToken();
    // 이메일 전송을 위한 transporter 설정
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.EMAIL_ID,
        clientSecret: process.env.EMAIL_SECRET,
        // refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token as string,
      },
    });
    // 이메일 옵션 구성
    const mailOptions: nodemailer.SendMailOptions = {
      from: "noreply@trivfamily.com",
      to: process.env.EMAIL_TO, // 수신할 이메일 주소
      subject: `새로운 캐스팅 문의: ${name}`,
      html: `
        <h2>캐스팅 문의</h2>
        <p><strong>문의제목:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        <p><strong>전화번호:</strong> ${phone}</p>
        <p><strong>작성자:</strong> ${position}</p>
        <p><strong>내용:</strong></p>
        <p>${message}</p>
      `,
    };

    // 포트폴리오 파일이 있는 경우 첨부
    if (portfolio) {
      const fileBuffer = await portfolio.arrayBuffer();
      mailOptions.attachments = [
        {
          filename: portfolio.name,
          content: Buffer.from(fileBuffer),
          contentType: portfolio.type,
        },
      ];
    }

    // 이메일 전송
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "이메일이 성공적으로 전송되었습니다." }, { status: 200 });
  } catch (error) {
    console.error("이메일 전송 실패:", error);
    return NextResponse.json({ message: "이메일 전송에 실패했습니다." }, { status: 500 });
  }
}

// FormData 처리를 위한 config
export const config = {
  api: {
    bodyParser: false,
  },
};
