import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { EquipmentListPDF } from "@/components/pdf/EquipmentListPDF";
import { prisma } from "@/lib/db";
import React from "react";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query
    const where: any = {
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch equipment from database
    const equipment = await prisma.equipment.findMany({
      where,
      select: {
        code: true,
        name: true,
        type: true,
        status: true,
        serialNumber: true,
        description: true,
      },
      orderBy: {
        code: "asc",
      },
    });

    const company = await prisma.company.findFirst();

    // Prepare data for PDF
    const pdfData = {
      equipment: equipment.map((item) => ({
        code: item.code,
        name: item.name,
        type: item.type,
        status: item.status,
        serialNumber: item.serialNumber,
        description: item.description,
      })),
      filters: {
        type: type || undefined,
        status: status || undefined,
        search: search || undefined,
      },
      company: company
        ? {
            name: company.name,
            ruc: company.ruc,
            address: company.address,
            email: company.email,
            phone: company.phone,
            logo: company.logo,
          }
        : undefined,
    };

    // Generate PDF stream
    const stream = await renderToStream(<EquipmentListPDF {...pdfData} />);

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
        "Content-Disposition": `attachment; filename="Inventario-Equipos-${timestamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF de equipos:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}

