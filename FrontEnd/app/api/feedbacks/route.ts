import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  let data;
  try {
    data = await request.json();
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Payload inválido' }, { status: 400 });
  }
  const filePath = path.join(process.cwd(), 'feedbacks.json');
  let feedbacks = [];
  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    feedbacks = JSON.parse(fileData);
  } catch (err) {
    feedbacks = [];
  }
  try {
    feedbacks.push(data);
    await fs.writeFile(filePath, JSON.stringify(feedbacks, null, 2), 'utf-8');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao salvar feedback' }, { status: 500 });
  }
}