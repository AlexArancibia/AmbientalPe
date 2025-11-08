import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ServiceOrderPDF } from "@/components/pdf/ServiceOrderPDF";
import { prisma } from "@/lib/db";
import React from "react";

interface ServiceOrderItem {
  code: string;
  name: string;
  description: string;
  quantity: number;
  days: number | null;
  unitPrice: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch service order data from database
    const serviceOrder = await prisma.serviceOrder.findUnique({
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
            days: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!serviceOrder || serviceOrder.deletedAt) {
      return NextResponse.json(
        { error: "Orden de servicio no encontrada" },
        { status: 404 }
      );
    }

    const company = await prisma.company.findFirst({
      include: {
        bankAccounts: {
          orderBy: [
            { isDefault: "desc" },
            { isDetraction: "desc" },
            { bankName: "asc" },
          ],
        },
      },
    });

    // Prepare data for PDF
    const pdfData = {
      number: serviceOrder.number,
      date: serviceOrder.date.toISOString(),
      currency: serviceOrder.currency,
      subtotal: Number(serviceOrder.subtotal),
      igv: Number(serviceOrder.igv),
      total: Number(serviceOrder.total),
      description: serviceOrder.description,
      paymentTerms: serviceOrder.paymentTerms,
      comments: serviceOrder.comments,
      attendantName: serviceOrder.attendantName,
      status: serviceOrder.status,
      client: {
        name: serviceOrder.client.name,
        ruc: serviceOrder.client.ruc,
        email: serviceOrder.client.email,
        address: serviceOrder.client.address,
      },
      gestor: {
        name: serviceOrder.gestor.name,
        email: serviceOrder.gestor.email,
      },
      items: serviceOrder.items.map((item: ServiceOrderItem) => ({
        code: item.code,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        days: item.days,
        unitPrice: Number(item.unitPrice),
      })),
      company: company
        ? {
            name: company.name,
            ruc: company.ruc,
            address: company.address,
            email: company.email,
            phone: company.phone,
            logo: company.logo,
            bankAccounts: company.bankAccounts.map((account) => ({
              bankName: account.bankName,
              accountNumber: account.accountNumber,
              accountType: account.accountType,
              currency: account.currency,
              isDefault: account.isDefault,
              isDetraction: account.isDetraction,
            })),
            primaryColor: company.primaryColor,
            secondaryColor: company.secondaryColor,
          }
        : undefined,
    };

    // Generate PDF stream
    const stream = await renderToStream(
      <ServiceOrderPDF serviceOrder={pdfData} />
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
        "Content-Disposition": `attachment; filename="Orden-Servicio-${serviceOrder.number}.pdf"`,
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

