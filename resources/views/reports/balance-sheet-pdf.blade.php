<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balance Sheet - {{ $tenant->name ?? 'Shop Management' }}</title>
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
        .balance-sheet-container {
            display: table;
            width: 100%;
            margin-top: 12px;
        }
        .assets-column, .liabilities-column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 5px;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 8px;
            padding: 5px;
            background-color: #000;
            color: #fff;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
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
        .balance-check {
            margin-top: 15px;
            padding: 8px;
            text-align: center;
            border: 1px solid #000;
            background-color: #f9f9f9;
            font-weight: bold;
            font-size: 10px;
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
        <div class="report-title">Balance Sheet</div>
        <div class="date-range">As at {{ $month_name }} {{ $year }}</div>
    </div>

    <div class="balance-sheet-container">
        <div class="assets-column">
            <div class="section-title">Property & Assets</div>
            <table>
                <tbody>
                    <tr>
                        <td>Bank Balance</td>
                        <td class="amount">{{ number_format($assets['bank_balance'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Customer Due</td>
                        <td class="amount">{{ number_format($assets['customer_due'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Fixed Assets</td>
                        <td class="amount">{{ number_format($assets['fixed_assets'], 2) }}</td>
                    </tr>
                    <tr>
                        <td>Stock Value</td>
                        <td class="amount">{{ number_format($assets['stock_value'], 2) }}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>TOTAL ASSETS</strong></td>
                        <td class="amount"><strong>{{ number_format($assets['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="liabilities-column">
            <div class="section-title">Fund & Liabilities</div>
            <table>
                <tbody>
                    <tr>
                        <td>Fund</td>
                        <td class="amount">{{ number_format($liabilities['fund'], 2) }}</td>
                    </tr>
                    @php
                        $totalProfit = $liabilities['profit'] + $liabilities['net_profit'];
                    @endphp
                    <tr>
                        <td>Profit</td>
                        <td class="amount">{{ number_format($totalProfit, 2) }}</td>
                    </tr>
                    <tr>
                        <td>&nbsp;</td>
                        <td class="amount">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>&nbsp;</td>
                        <td class="amount">&nbsp;</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>TOTAL LIABILITIES</strong></td>
                        <td class="amount"><strong>{{ number_format($liabilities['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    @php
        $difference = abs($assets['total'] - $liabilities['total']);
        $isBalanced = $difference < 0.01;
    @endphp

    <div class="balance-check">
        @if($isBalanced)
            Balance Sheet is Balanced
        @else
            Difference: {{ number_format($difference, 2) }}
        @endif
    </div>

    <div class="footer">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
