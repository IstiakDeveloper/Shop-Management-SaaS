<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Income & Expenditure Report - {{ $company_name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .company-name {
            font-size: 20px;
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
        .report-container {
            display: table;
            width: 100%;
            margin-top: 20px;
        }
        .income-column, .expenditure-column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 10px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
            padding: 8px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
        }
        .income-title {
            background-color: #e8f5e8;
            border-color: #4caf50;
            color: #2e7d32;
        }
        .expenditure-title {
            background-color: #ffebee;
            border-color: #f44336;
            color: #c62828;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .amount {
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            border-top: 2px solid #333;
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .income-total {
            color: #2e7d32;
        }
        .expenditure-total {
            color: #c62828;
        }
        .net-result {
            margin-top: 30px;
            padding: 15px;
            text-align: center;
            border: 2px solid #333;
            font-weight: bold;
            font-size: 14px;
        }
        .net-profit {
            background-color: #e8f5e8;
            color: #2e7d32;
            border-color: #4caf50;
        }
        .net-loss {
            background-color: #ffebee;
            color: #c62828;
            border-color: #f44336;
        }
        .currency {
            font-family: 'DejaVu Sans', sans-serif;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company_name }}</div>
        <div class="report-title">Income & Expenditure Report</div>
        <div class="date-range">{{ $start_date }} to {{ $end_date }}</div>
    </div>

    <div class="report-container">
        <div class="income-column">
            <div class="section-title income-title">INCOME</div>
            <table>
                <tbody>
                    @foreach($income['categories'] as $key => $item)
                        <tr>
                            <td>{{ $item['name'] }}</td>
                            <td class="amount currency">Tk {{ number_format($item['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row income-total">
                        <td><strong>TOTAL INCOME</strong></td>
                        <td class="amount currency"><strong>Tk {{ number_format($income['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="expenditure-column">
            <div class="section-title expenditure-title">EXPENDITURE</div>
            <table>
                <tbody>
                    @foreach($expenditure['categories'] as $key => $item)
                        <tr>
                            <td>{{ $item['name'] }}</td>
                            <td class="amount currency">Tk {{ number_format($item['amount'], 2) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row expenditure-total">
                        <td><strong>TOTAL EXPENDITURE</strong></td>
                        <td class="amount currency"><strong>Tk {{ number_format($expenditure['total'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    @php
        $netResult = $income['total'] - $expenditure['total'];
        $isProfit = $netResult >= 0;
    @endphp

    <div class="net-result {{ $isProfit ? 'net-profit' : 'net-loss' }}">
        @if($isProfit)
            NET PROFIT: Tk {{ number_format($netResult, 2) }}
        @else
            NET LOSS: Tk {{ number_format(abs($netResult), 2) }}
        @endif
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #666;">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
