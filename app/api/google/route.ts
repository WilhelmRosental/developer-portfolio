import axios from "axios";
import { NextResponse } from "next/server";

interface RequestBody {
  token: string;
}

interface CaptchaResponse {
  success: boolean;
  [key: string]: any;
}

export async function POST(request: Request): Promise<NextResponse> {
  const reqBody: RequestBody = await request.json();
  const secret_key: string | undefined = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;

  try {
    const url: string = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${reqBody.token}`;

    const res = await axios.post<CaptchaResponse>(url);
    if (res.data.success) {
      return NextResponse.json({
        message: "Captcha verification success!!",
        success: true,
      });
    }

    return NextResponse.json({
      error: "Captcha verification failed!",
      success: false,
    }, { status: 500 });
  } catch (error) {
    return NextResponse.json({
      error: "Captcha verification failed!",
      success: false,
    }, { status: 500 });
  }
};