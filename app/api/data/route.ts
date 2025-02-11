import { NextResponse } from "next/server";

interface ResponseData {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export async function GET(request: Request): Promise<NextResponse<ResponseData>> {
  return NextResponse.json<ResponseData>({
    success: true,
    message: 'hle!',
    data: {
      message: 'Message and email sent successfully!',
    }
  }, { status: 200 });
};