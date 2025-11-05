<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Income & Expenditure Report - {{ $tenant->name ?? 'Shop Management' }}</title>
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
        .period-title {
            text-align: center;
            margin: 15px 0 10px 0;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .report-container {
            display: table;
            width: 100%;
            margin-top: 10px;
        }
        .income-column, .expenditure-column {
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
        .net-result {
            margin-top: 12px;
            margin-bottom: 15px;
            padding: 8px;
            text-align: center;
            border: 1px solid #000;
            background-color: #f9f9f9;
            font-weight: bold;
            font-size: 10px;
        }
        .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 8px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }
        .page-break { page-break-before: always; }
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
        <div class="report-title">Income & Expenditure Report</div>
        <div class="date-range">{{ $month }} {{ $year }}</div>
    </div>

    <div class="period-title">Monthly ({{ $month }} {{ $year }})</div>
    <div class="report-container">
        <div class="income-column">
            <div class="section-title">Income</div>
            <table>
                <tbody>
                    @foreach($monthly['income']['categories'] as $item)
                        <tr>
                            <td>{{ $item['name'] }}</td>
                            <td class="amount">{{ number_format($item['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td><strong>TOTAL INCOME</strong></td>
                        <td class="amount"><strong>{{ number_format($monthly['income']['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="expenditure-column">
            <div class="section-title">Expenditure</div>
            <table>
                <tbody>
                    @foreach($monthly['expenditure']['categories'] as $item)
                        <tr>
                            <td>{{ $item['name'] }}</td>
                            <td class="amount">{{ number_format($item['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td><strong>TOTAL EXPENDITURE</strong></td>
                        <td class="amount"><strong>{{ number_format($monthly['expenditure']['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    @php
        $monthlyNetResult = $monthly['net_profit'];
    @endphp

    <div class="net-result">
        @if($monthlyNetResult >= 0)
            Monthly Net Profit: {{ number_format($monthlyNetResult, 2) }}
        @else
            Monthly Net Loss: ({{ number_format(abs($monthlyNetResult), 2) }})
        @endif
    </div>

    <div class="page-break"></div>
    <div class="period-title">Cumulative (January to {{ $month }} {{ $year }})</div>
    <div class="report-container">
        <div class="income-column">
            <div class="section-title">Income</div>
            <table>
                <tbody>
                    @foreach($cumulative['income']['categories'] as $item)
                        <tr>
                            <td>{{ $item['name'] }}</td>
                            <td class="amount">{{ number_format($item['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td><strong>TOTAL INCOME</strong></td>
                        <td class="amount"><strong>{{ number_format($cumulative['income']['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="expenditure-column">
            <div class="section-title">Expenditure</div>
            <table>
                <tbody>
                    @foreach($cumulative['expenditure']['categories'] as $item)
                        <tr>
                            <td>{{ $item['name'] }}</td>
                            <td class="amount">{{ number_format($item['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td><strong>TOTAL EXPENDITURE</strong></td>
                        <td class="amount"><strong>{{ number_format($cumulative['expenditure']['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    @php
        $cumulativeNetResult = $cumulative['net_profit'];
    @endphp

    <div class="net-result">
        @if($cumulativeNetResult >= 0)
            Cumulative Net Profit: {{ number_format($cumulativeNetResult, 2) }}
        @else
            Cumulative Net Loss: ({{ number_format(abs($cumulativeNetResult), 2) }})
        @endif
    </div>

    <div class="footer">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
