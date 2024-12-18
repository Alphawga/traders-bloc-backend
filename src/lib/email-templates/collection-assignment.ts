export const collectionAssignmentTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Add your styles here */
  </style>
</head>
<body>
  <h2>New Collection Assignment</h2>
  <p>Hello {{recipientName}},</p>
  <p>A new invoice has been marked as fully treated and requires collection:</p>
  
  <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
    <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
    <p><strong>Vendor:</strong> {{vendorName}}</p>
    <p><strong>Total Amount:</strong> ${{totalAmount}}</p>
    
    <h3>Milestones:</h3>
    <ul>
      {{#each milestones}}
      <li>{{title}} - ${{amount}}</li>
      {{/each}}
    </ul>
  </div>

  <p>Please review the invoice details and proceed with the collection process.</p>
  <a href="{{link}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
    View Invoice Details
  </a>

  <p>Best regards,<br>Traders Platform</p>
</body>
</html>
` 