import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { OrdersListPDF } from "@/components/pdf/OrdersListPDF";
import { prisma } from "@/lib/db";
import React from "react";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    // Build query for service orders
    const serviceWhere: any = {
      deletedAt: null,
    };

    if (search) {
      serviceWhere.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { 
          client: { 
            name: { contains: search, mode: "insensitive" } 
          } 
        },
      ];
    }

    // Build query for purchase orders
    const purchaseWhere: any = {
      deletedAt: null,
    };

    if (search) {
      purchaseWhere.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { 
          client: { 
            name: { contains: search, mode: "insensitive" } 
          } 
        },
      ];
    }

    // Fetch service orders from database
    const serviceOrders = await prisma.serviceOrder.findMany({
      where: serviceWhere,
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

    // Fetch purchase orders from database
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: purchaseWhere,
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
    const totalServiceAmount = serviceOrders.reduce((sum, o) => sum + o.total, 0);
    const totalPurchaseAmount = purchaseOrders.reduce((sum, o) => sum + o.total, 0);

    // Prepare data for PDF
    const pdfData = {
      serviceOrders: serviceOrders.map((o) => ({
        number: o.number,
        date: o.date.toISOString(),
        client: { name: o.client.name },
        currency: o.currency,
        total: o.total,
        status: o.status,
      })),
      purchaseOrders: purchaseOrders.map((o) => ({
        number: o.number,
        date: o.date.toISOString(),
        client: { name: o.client.name },
        currency: o.currency,
        total: o.total,
        status: o.status,
      })),
      filters: {
        search: search || undefined,
      },
      summary: {
        totalServiceOrders: serviceOrders.length,
        totalPurchaseOrders: purchaseOrders.length,
        totalServiceAmount,
        totalPurchaseAmount,
      },
    };

    // Generate PDF stream
    const stream = await renderToStream(<OrdersListPDF {...pdfData} />);

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
        "Content-Disposition": `attachment; filename="Reporte-Ordenes-${timestamp}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF de órdenes:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}

