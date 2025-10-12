import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ClientListPDF } from "@/components/pdf/ClientListPDF";
import { prisma } from "@/lib/db";
import React from "react";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    // Build query
    const where: any = {
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { ruc: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch clients from database
    const clients = await prisma.client.findMany({
      where,
      select: {
        name: true,
        ruc: true,
        email: true,
        address: true,
        type: true,
        contactPerson: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Prepare data for PDF
    const pdfData = {
      clients: clients.map((client) => ({
        name: client.name,
        ruc: client.ruc,
        email: client.email,
        address: client.address,
        type: client.type,
        contactPerson: client.contactPerson,
      })),
      filters: {
        type: type || undefined,
        search: search || undefined,
      },
    };

    // Generate PDF stream
    const stream = await renderToStream(<ClientListPDF {...pdfData} />);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF with proper headers
    const timestamp = new Date().toISOString().split("T")[0];
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Clientes-${timestamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF de clientes:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}

