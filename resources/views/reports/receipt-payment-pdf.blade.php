<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt & Payment Report</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .date-range {
            font-size: 12px;
            color: #666;
        }
        .content {
            display: flex;
            gap: 20px;
        }
        .column {
            flex: 1;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table-header {
            background-color: #f8f9fa;
            padding: 8px;
            font-weight: bold;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        .receipt-header {
            background-color: #d4edda;
            color: #155724;
        }
        .payment-header {
            background-color: #f8d7da;
            color: #721c24;
        }
        th, td {
            padding: 6px 8px;
            border: 1px solid #dee2e6;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .amount {
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            font-weight: bold;
            background-color: #f8f9fa;
        }
        .receipt-total {
            background-color: #d4edda;
            color: #155724;
        }
        .payment-total {
            background-color: #f8d7da;
            color: #721c24;
        }
        .text-right {
            text-align: right;
        }
        .page-break {
            page-break-after: always;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company_name }}</div>
        <div class="report-title">Receipt & Payment Report</div>
        <div class="date-range">From {{ $start_date }} to {{ $end_date }}</div>
    </div>

    <div class="content">
        <!-- Receipts Column -->
        <div class="column">
            <div class="table-header receipt-header">RECEIPTS</div>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Amount (Tk)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Opening Cash</td>
                        <td class="amount">{{ number_format($receipts['opening_cash'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Sale Collection</td>
                        <td class="amount">{{ number_format($receipts['sale_collection'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Customer Payments</td>
                        <td class="amount">{{ number_format($receipts['customer_payments'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Other Income</td>
                        <td class="amount">{{ number_format($receipts['other_income'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Fund Receive</td>
                        <td class="amount">{{ number_format($receipts['fund_receive'], 2) }}</td>
                    </tr>
                    <tr class="total-row receipt-total">
                        <td><strong>Total Receipts</strong></td>
                        <td class="amount"><strong>{{ number_format($receipts['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Payments Column -->
        <div class="column">
            <div class="table-header payment-header">PAYMENTS</div>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Amount (Tk)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Purchase</td>
                        <td class="amount">{{ number_format($payments['purchase'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Vendor Payments</td>
                        <td class="amount">{{ number_format($payments['vendor_payments'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Expenses</td>
                        <td class="amount">{{ number_format($payments['expenses'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Fixed Asset Purchases</td>
                        <td class="amount">{{ number_format($payments['fixed_asset_purchases'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Other Payments</td>
                        <td class="amount">{{ number_format($payments['other_payments'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Closing Cash at Bank</td>
                        <td class="amount">{{ number_format($payments['closing_cash'], 2) }}</td>
                    </tr>
                    <tr class="total-row payment-total">
                        <td><strong>Total Payments</strong></td>
                        <td class="amount"><strong>{{ number_format($payments['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="footer">
        <p>Generated on {{ date('d M Y H:i:s') }}</p>
    </div>
</body>
</html>
