/** @format */

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, contactMethod, position, message } = body;

    // 이메일 전송을 위한 transporter 설정
    const transporter = nodemailer.createTransport({
      service: "gmail", // 또는 다른 이메일 서비스
      auth: {
        user: process.env.APP_USER, // Gmail 주소
        pass: process.env.APP_PASSWORD, // Gmail 앱 비밀번호
      },
    });

    // 이메일 내용 구성
    const mailOptions = {
      from: process.env.APP_USER,
      to: email, // 수신할 이메일 주소
      subject: `새로운 캐스팅 문의: ${name}`,
      html: `
        <h2>캐스팅 문의</h2>
        <p><strong>문의제목:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        <p><strong>전화번호:</strong> ${phone}</p>
        <p><strong>선호 연락 방법:</strong> ${contactMethod}</p>
        <p><strong>작성자:</strong> ${position}</p>
        <p><strong>내용:</strong></p>
        <p>${message}</p>
      `,
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "이메일이 성공적으로 전송되었습니다." }, { status: 200 });
  } catch (error) {
    console.error("이메일 전송 실패:", error);
    return NextResponse.json({ message: "이메일 전송에 실패했습니다." }, { status: 500 });
  }
}
