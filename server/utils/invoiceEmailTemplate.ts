import type { EventHandler, EventHandlerRequest } from "h3";

export function defineWrappedResponseHandler<T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler<T>(async (event) => {
    try {
      const response = await handler(event);
      return { response };
    }
    catch (err) {
      // Error handling
      return { err };
    }
  });
}
export function getInvoiceEmailTemplate(
  studentName: string,
  invoiceNumber: string,
  amount: string,
  dueDate: string,
  dateIssued: string,
  dateDue: string,
  amountTotal: string,
  amountPaid: string,
  amountDue: string,
) {
  const htmlTemplate = `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .email-container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #214d49;
        }
        .header h1 {
            color: #214d49;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #666;
            margin: 5px 0;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .invoice-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #214d49;
        }
        .invoice-details h3 {
            color: #214d49;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .invoice-details ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .invoice-details li {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .invoice-details li:last-child {
            border-bottom: none;
        }
        .invoice-details .label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        .amount-due {
            background-color: #dc3545;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            text-align: center;
            margin: 15px 0;
            font-weight: bold;
        }
        .payment-options {
            margin: 25px 0;
        }
        .payment-options h3 {
            color: #214d49;
            margin-bottom: 15px;
        }
        .payment-method {
            background-color: #e8f4f8;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .payment-method h4 {
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        .payment-method ul {
            margin: 0;
            padding-left: 20px;
        }
        .contact-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .contact-info h4 {
            color: #214d49;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
        }
        .footer .signature {
            margin-bottom: 15px;
        }
        .footer .company-info {
            color: #666;
            font-size: 14px;
        }
        .disclaimer {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Kings Hostel Management</h1>
            <p>University Campus, Accra, Ghana</p>
            <p>kingshostelmgt@gmail.com | +233 30 277 8899</p>
        </div>

        <div class="greeting">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>We hope this message finds you well.</p>
            <p>Please find attached your invoice from Kings Hostel Management. We kindly request your prompt attention to this matter.</p>
        </div>

        <div class="invoice-details">
            <h3>📄 Invoice Details</h3>
            <ul>
                <li><span class="label">Invoice ID:</span> ${invoiceNumber}</li>
                <li><span class="label">Date Issued:</span> ${dateIssued}</li>
                <li><span class="label">Due Date:</span> ${dateDue}</li>
                <li><span class="label">Total Amount:</span> ${amountTotal}</li>
                <li><span class="label">Amount Paid:</span> ${amountPaid}</li>
            </ul>
            
            <div class="amount-due">
                <strong>Amount Due: ${amountDue}</strong>
            </div>
        </div>

        <div class="payment-options">
            <h3>💳 Payment Options</h3>
            <p>You can make your payment through any of the following convenient methods:</p>
            
            <div class="payment-method">
                <h4>🏦 Bank Transfer</h4>
                <ul>
                    <li><strong>Bank:</strong> Ghana Commercial Bank</li>
                    <li><strong>Account Name:</strong> Kings Hostel Management</li>
                    <li><strong>Account Number:</strong> 1234567890</li>
                </ul>
            </div>

            <div class="payment-method">
                <h4>📱 Mobile Money</h4>
                <ul>
                    <li><strong>MTN/Vodafone:</strong> +233 54 968 4848</li>
                    <li><strong>Reference:</strong> ${invoiceNumber}</li>
                </ul>
            </div>
        </div>

        <div class="contact-info">
            <h4>📞 Need Help?</h4>
            <p>For any questions regarding your invoice or payment options, please contact our billing department:</p>
            <p><strong>Email:</strong> kingshostelmgt@gmail.com</p>
            <p><strong>Phone:</strong> +233 30 277 8899</p>
            <p><strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
        </div>

             <div class="disclaimer">
            <p>⚠️ This is an automated message. Please do not reply directly to this email. For inquiries, use the contact information provided above.</p>
        </div>
    </div>
</body>
</html>
  `;

  const textTemplate = `
Dear ${studentName},

We hope this message finds you well.

Please find attached your invoice from Kings Hostel Management. We kindly request your prompt attention to this matter.

Invoice Details:
- Invoice ID: ${invoiceNumber}
- Date Issued: ${dateIssued}
- Due Date: ${dateDue}
- Total Amount: ${amountTotal}
- Amount Paid: ${amountPaid}

Amount Due: ${amountDue}

Payment Options:
You can make your payment through any of the following convenient methods:

1. Bank Transfer
   - Bank: Ghana Commercial Bank
   - Account Name: Kings Hostel Management
   - Account Number: 1234567890

2. Mobile Money
   - MTN/Vodafone: +233 54 968 4848
   - Reference: ${invoiceNumber}

Need Help?
For any questions regarding your invoice or payment options, please contact our billing department:
- Email: kingshostelmgt@gmail.com
- Phone: +233 30 277 8899
- Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
  `;

  return { htmlTemplate, textTemplate };
}
