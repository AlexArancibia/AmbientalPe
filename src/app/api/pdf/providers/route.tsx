import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ProviderListPDF } from "@/components/pdf/ProviderListPDF";
import { prisma } from "@/lib/db";
import React from "react";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    // Build query - Filter only providers
    const where: any = {
      deletedAt: null,
      type: "PROVIDER",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { ruc: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch providers from database
    const providers = await prisma.client.findMany({
      where,
      select: {
        name: true,
        ruc: true,
        email: true,
        address: true,
        contactPerson: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Prepare data for PDF
    const pdfData = {
      providers: providers.map((provider) => ({
        name: provider.name,
        ruc: provider.ruc,
        email: provider.email,
        address: provider.address,
        contactPerson: provider.contactPerson,
      })),
      filters: {
        search: search || undefined,
      },
    };

    // Generate PDF stream
    const stream = await renderToStream(<ProviderListPDF {...pdfData} />);

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
        "Content-Disposition": `attachment; filename="Proveedores-${timestamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF de proveedores:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}

