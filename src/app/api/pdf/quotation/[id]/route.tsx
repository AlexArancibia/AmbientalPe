import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { QuotationPDF } from "@/components/pdf/QuotationPDF";
import { prisma } from "@/lib/db";
import React from "react";

interface QuotationItem {
  code: string;
  name: string;
  description: string;
  quantity: number;
  days: number;
  unitPrice: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch company information
    const company = await prisma.company.findFirst({
      include: {
        bankAccounts: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    // Fetch quotation data from database
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            ruc: true,
            email: true,
            address: true,
          },
        },
        items: {
          where: { deletedAt: null },
          select: {
            code: true,
            name: true,
            description: true,
            quantity: true,
            days: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!quotation || quotation.deletedAt) {
      return NextResponse.json(
        { error: "Cotización no encontrada" },
        { status: 404 }
      );
    }

    // Prepare data for PDF
    const pdfData = {
      number: quotation.number,
      date: quotation.date.toISOString(),
      validityDays: quotation.validityDays,
      currency: quotation.currency,
      subtotal: Number(quotation.subtotal),
      igv: Number(quotation.igv),
      total: Number(quotation.total),
      notes: quotation.notes,
      equipmentReleaseDate: quotation.equipmentReleaseDate.toISOString(),
      returnDate: quotation.returnDate?.toISOString() || null,
      monitoringLocation: quotation.monitoringLocation || "",
      client: {
        name: quotation.client.name,
        ruc: quotation.client.ruc,
        email: quotation.client.email,
        address: quotation.client.address,
      },
      items: quotation.items.map((item: QuotationItem) => ({
        code: item.code,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        days: item.days,
        unitPrice: Number(item.unitPrice),
      })),
      company: company ? {
        name: company.name,
        ruc: company.ruc,
        address: company.address,
        email: company.email,
        phone: company.phone,
        logo: company.logo,
        bankAccount: company.bankAccounts[0] || null,
      } : undefined,
    };

    // Generate PDF stream
    const stream = await renderToStream(
      <QuotationPDF quotation={pdfData} />
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF with proper headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Cotizacion-${quotation.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}
