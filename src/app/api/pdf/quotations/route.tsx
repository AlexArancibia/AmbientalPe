import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { QuotationListPDF } from "@/components/pdf/QuotationListPDF";
import { prisma } from "@/lib/db";
import React from "react";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Fetch company information
    const company = await prisma.company.findFirst();

    // Build query
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { 
          client: { 
            name: { contains: search, mode: "insensitive" } 
          } 
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Fetch quotations from database
    const quotations = await prisma.quotation.findMany({
      where,
      select: {
        number: true,
        date: true,
        currency: true,
        total: true,
        status: true,
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate summary
    const totalAmount = quotations.reduce((sum, q) => sum + q.total, 0);
    const byStatus = quotations.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Prepare data for PDF
    const pdfData = {
      quotations: quotations.map((q) => ({
        number: q.number,
        date: q.date.toISOString(),
        client: { name: q.client.name },
        currency: q.currency,
        total: q.total,
        status: q.status,
      })),
      filters: {
        search: search || undefined,
        status: status || undefined,
      },
      summary: {
        totalQuotations: quotations.length,
        totalAmount,
        byStatus,
      },
      company: company ? {
        name: company.name,
        ruc: company.ruc,
        address: company.address,
        email: company.email,
        phone: company.phone,
        logo: company.logo,
      } : undefined,
    };

    // Generate PDF stream
    const stream = await renderToStream(<QuotationListPDF {...pdfData} />);

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
        "Content-Disposition": `attachment; filename="Reporte-Cotizaciones-${timestamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF de cotizaciones:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}

