import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { PurchaseOrderPDF } from "@/components/pdf/PurchaseOrderPDF";
import { prisma } from "@/lib/db";
import React from "react";

interface PurchaseOrderItem {
  code: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch purchase order data from database
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
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
        gestor: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          where: { deletedAt: null },
          select: {
            code: true,
            name: true,
            description: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!purchaseOrder || purchaseOrder.deletedAt) {
      return NextResponse.json(
        { error: "Orden de compra no encontrada" },
        { status: 404 }
      );
    }

    // Prepare data for PDF
    const pdfData = {
      number: purchaseOrder.number,
      date: purchaseOrder.date.toISOString(),
      currency: purchaseOrder.currency,
      subtotal: Number(purchaseOrder.subtotal),
      igv: Number(purchaseOrder.igv),
      total: Number(purchaseOrder.total),
      description: purchaseOrder.description,
      paymentTerms: purchaseOrder.paymentTerms,
      comments: purchaseOrder.comments,
      attendantName: purchaseOrder.attendantName,
      status: purchaseOrder.status,
      client: {
        name: purchaseOrder.client.name,
        ruc: purchaseOrder.client.ruc,
        email: purchaseOrder.client.email,
        address: purchaseOrder.client.address,
      },
      gestor: {
        name: purchaseOrder.gestor.name,
        email: purchaseOrder.gestor.email,
      },
      items: purchaseOrder.items.map((item: PurchaseOrderItem) => ({
        code: item.code,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    };

    // Generate PDF stream
    const stream = await renderToStream(
      <PurchaseOrderPDF purchaseOrder={pdfData} />
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
        "Content-Disposition": `attachment; filename="Orden-Compra-${purchaseOrder.number}.pdf"`,
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

