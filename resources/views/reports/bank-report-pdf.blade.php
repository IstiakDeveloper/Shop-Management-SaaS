<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Report - {{ $company_name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            margin: 0;
            padding: 15px;
            line-height: 1.3;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .report-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .account-info {
            font-size: 12px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 9px;
        }
        th, td {
            border: 1px solid #333;
            padding: 4px 2px;
            text-align: center;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .deposit-header {
            background-color: #e8f5e8;
            color: #2e7d32;
        }
        .withdrawal-header {
            background-color: #ffebee;
            color: #c62828;
        }
        .deposit-amount {
            color: #2e7d32;
            font-weight: bold;
        }
        .withdrawal-amount {
            color: #c62828;
            font-weight: bold;
        }
        .balance-amount {
            color: #1565c0;
            font-weight: bold;
        }
        .opening-row, .closing-row {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .currency {
            font-family: 'DejaVu Sans', sans-serif;
        }
        .zero-amount {
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company_name }}</div>
        <div class="report-title">Bank Report</div>
        <div class="account-info">{{ $account_name }} - {{ $month_name }} {{ $year }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="2" style="width: 15%;">Date</th>
                <th colspan="3" class="deposit-header">Deposit</th>
                <th colspan="4" class="withdrawal-header">Withdrawal</th>
                <th rowspan="2" style="width: 15%;">Bank Balance</th>
            </tr>
            <tr>
                <th class="deposit-header" style="width: 10%;">Opening</th>
                <th class="deposit-header" style="width: 10%;">Sale</th>
                <th class="deposit-header" style="width: 10%;">Total</th>
                <th class="withdrawal-header" style="width: 10%;">Purchase</th>
                <th class="withdrawal-header" style="width: 12%;">Vendor Payment</th>
                <th class="withdrawal-header" style="width: 10%;">Expense</th>
                <th class="withdrawal-header" style="width: 10%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($daily_transactions as $index => $transaction)
                <tr class="{{ in_array($transaction['date'], ['Opening Balance', 'Closing Balance']) ? ($transaction['date'] == 'Opening Balance' ? 'opening-row' : 'closing-row') : '' }}">
                    <td style="font-weight: bold;">{{ $transaction['date'] }}</td>

                    <!-- Deposit columns -->
                    <td class="{{ $transaction['deposit']['fund'] > 0 ? 'deposit-amount' : 'zero-amount' }} currency">
                        {{ $transaction['deposit']['fund'] > 0 ? 'Tk ' . number_format($transaction['deposit']['fund'], 2) : '0.00' }}
                    </td>
                    <td class="{{ $transaction['deposit']['sale_receive'] > 0 ? 'deposit-amount' : 'zero-amount' }} currency">
                        {{ $transaction['deposit']['sale_receive'] > 0 ? 'Tk ' . number_format($transaction['deposit']['sale_receive'], 2) : '0.00' }}
                    </td>
                    <td class="{{ $transaction['deposit']['total'] > 0 ? 'deposit-amount' : 'zero-amount' }} currency" style="background-color: #e8f5e8;">
                        {{ $transaction['deposit']['total'] > 0 ? 'Tk ' . number_format($transaction['deposit']['total'], 2) : '0.00' }}
                    </td>

                    <!-- Withdrawal columns -->
                    <td class="{{ $transaction['withdrawal']['purchase'] > 0 ? 'withdrawal-amount' : 'zero-amount' }} currency">
                        {{ $transaction['withdrawal']['purchase'] > 0 ? 'Tk ' . number_format($transaction['withdrawal']['purchase'], 2) : '0.00' }}
                    </td>
                    <td class="{{ $transaction['withdrawal']['vendor_payment'] > 0 ? 'withdrawal-amount' : 'zero-amount' }} currency">
                        {{ $transaction['withdrawal']['vendor_payment'] > 0 ? 'Tk ' . number_format($transaction['withdrawal']['vendor_payment'], 2) : '0.00' }}
                    </td>
                    <td class="{{ $transaction['withdrawal']['expense'] > 0 ? 'withdrawal-amount' : 'zero-amount' }} currency">
                        {{ $transaction['withdrawal']['expense'] > 0 ? 'Tk ' . number_format($transaction['withdrawal']['expense'], 2) : '0.00' }}
                    </td>
                    <td class="{{ $transaction['withdrawal']['total'] > 0 ? 'withdrawal-amount' : 'zero-amount' }} currency" style="background-color: #ffebee;">
                        {{ $transaction['withdrawal']['total'] > 0 ? 'Tk ' . number_format($transaction['withdrawal']['total'], 2) : '0.00' }}
                    </td>

                    <!-- Bank Balance -->
                    <td class="balance-amount currency">Tk {{ number_format($transaction['bank_balance'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 30px; text-align: center; font-size: 8px; color: #666;">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
