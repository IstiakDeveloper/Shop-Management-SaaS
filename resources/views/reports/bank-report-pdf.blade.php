<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Report - {{ $tenant->name ?? 'Shop Management' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8px;
            padding: 10px;
            line-height: 1.2;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #000;
        }
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
        }
        .company-info {
            font-size: 7px;
            color: #333;
            margin-bottom: 6px;
        }
        .report-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
        }
        .account-info {
            font-size: 8px;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 7px;
        }
        th, td {
            border: 1px solid #000;
            padding: 3px 2px;
            text-align: center;
        }
        th {
            background-color: #000;
            color: #fff;
            font-weight: bold;
            font-size: 7px;
        }
        .deposit-header {
            background-color: #333;
        }
        .withdrawal-header {
            background-color: #333;
        }
        .amount-cell {
            text-align: right;
            font-family: 'DejaVu Sans', monospace;
        }
        .opening-row {
            background-color: #e0e0e0;
            font-weight: bold;
        }
        .total-row {
            background-color: #d0d0d0;
            font-weight: bold;
        }
        .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 7px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 6px;
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
        <div class="report-title">Bank Report</div>
        <div class="account-info">{{ $account_name }} - {{ $month_name }} {{ $year }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="2" style="width: 12%;">Date</th>
                <th colspan="3" class="deposit-header">Deposit</th>
                <th colspan="4" class="withdrawal-header">Withdrawal</th>
                <th rowspan="2" style="width: 12%;">Balance</th>
            </tr>
            <tr>
                <th class="deposit-header" style="width: 9%;">Opening</th>
                <th class="deposit-header" style="width: 9%;">Sale</th>
                <th class="deposit-header" style="width: 9%;">Total</th>
                <th class="withdrawal-header" style="width: 9%;">Purchase</th>
                <th class="withdrawal-header" style="width: 10%;">Vendor Pay</th>
                <th class="withdrawal-header" style="width: 9%;">Expense</th>
                <th class="withdrawal-header" style="width: 9%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($daily_transactions as $transaction)
                @php
                    $isSpecialRow = in_array($transaction['date'], ['Previous Month Balance', 'Month Total:']);
                    $rowClass = $transaction['date'] === 'Previous Month Balance' ? 'opening-row' :
                               ($transaction['date'] === 'Month Total:' ? 'total-row' : '');
                @endphp
                <tr class="{{ $rowClass }}">
                    <td style="text-align: left; font-size: 7px;">{{ $transaction['date'] }}</td>
                    <td class="amount-cell">{{ $transaction['deposit']['fund'] > 0 ? number_format($transaction['deposit']['fund'], 0) : '-' }}</td>
                    <td class="amount-cell">{{ $transaction['deposit']['sale_receive'] > 0 ? number_format($transaction['deposit']['sale_receive'], 0) : '-' }}</td>
                    <td class="amount-cell">{{ $transaction['deposit']['total'] > 0 ? number_format($transaction['deposit']['total'], 0) : '-' }}</td>
                    <td class="amount-cell">{{ $transaction['withdrawal']['purchase'] > 0 ? number_format($transaction['withdrawal']['purchase'], 0) : '-' }}</td>
                    <td class="amount-cell">{{ $transaction['withdrawal']['vendor_payment'] > 0 ? number_format($transaction['withdrawal']['vendor_payment'], 0) : '-' }}</td>
                    <td class="amount-cell">{{ $transaction['withdrawal']['expense'] > 0 ? number_format($transaction['withdrawal']['expense'], 0) : '-' }}</td>
                    <td class="amount-cell">{{ $transaction['withdrawal']['total'] > 0 ? number_format($transaction['withdrawal']['total'], 0) : '-' }}</td>
                    <td class="amount-cell" style="font-weight: bold;">{{ number_format($transaction['bank_balance'], 0) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
