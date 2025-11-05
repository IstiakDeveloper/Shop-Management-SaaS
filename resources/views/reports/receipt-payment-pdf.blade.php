<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt & Payment Report - {{ $tenant->name ?? 'Shop Management' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            padding: 15px;
            line-height: 1.3;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 3px;
            text-transform: uppercase;
        }
        .company-info {
            font-size: 9px;
            color: #333;
            margin-bottom: 8px;
        }
        .report-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
            text-transform: uppercase;
        }
        .date-range {
            font-size: 9px;
            color: #555;
        }
        .content {
            display: table;
            width: 100%;
            margin-top: 12px;
        }
        .column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .table-header {
            background-color: #000;
            color: #fff;
            padding: 5px;
            font-weight: bold;
            text-align: center;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        td {
            padding: 5px 6px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
        }
        .amount {
            text-align: right;
            font-family: 'DejaVu Sans', monospace;
        }
        .total-row {
            border-top: 2px solid #000;
            border-bottom: 2px double #000;
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $tenant->name ?? 'Shop Management' }}</div>
        @if($tenant)
        <div class="company-info">
            @if($tenant->address) {{ $tenant->address }} | @endif
            @if($tenant->phone) Phone: {{ $tenant->phone }} | @endif
            @if($tenant->email) Email: {{ $tenant->email }} @endif
        </div>
        @endif
        <div class="report-title">Receipt & Payment Report</div>
        <div class="date-range">{{ $start_date }} to {{ $end_date }}</div>
    </div>

    <div class="content">
        <div class="column">
            <div class="table-header">Receipts</div>
            <table>
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
                    <tr class="total-row">
                        <td><strong>TOTAL RECEIPTS</strong></td>
                        <td class="amount"><strong>{{ number_format($receipts['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="column">
            <div class="table-header">Payments</div>
            <table>
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
                    <tr class="total-row">
                        <td><strong>TOTAL PAYMENTS</strong></td>
                        <td class="amount"><strong>{{ number_format($payments['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="footer">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
