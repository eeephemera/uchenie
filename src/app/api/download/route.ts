import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filePathParam = url.searchParams.get("filePath");

    if (!filePathParam) {
      return NextResponse.json({ message: "File path is required" }, { status: 400 });
    }

    const allowedDirectory = path.resolve(process.cwd(), "public", "uploads");
    const absoluteFilePath = path.join(allowedDirectory, path.basename(filePathParam));

    console.log(`Requested file path: ${filePathParam}`);
    console.log(`Resolved absolute file path: ${absoluteFilePath}`);
    console.log(`Allowed directory: ${allowedDirectory}`);

    if (!absoluteFilePath.startsWith(allowedDirectory)) {
      console.error("Access to this file is forbidden");
      return NextResponse.json({ message: "Access to this file is forbidden" }, { status: 403 });
    }

    const fileExists = await fs.stat(absoluteFilePath).then(() => true).catch(() => false);
    if (!fileExists) {
      console.error("File not found");
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const fileContent = await fs.readFile(absoluteFilePath);
    const fileName = encodeURIComponent(path.basename(absoluteFilePath));

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error while handling file download request:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
