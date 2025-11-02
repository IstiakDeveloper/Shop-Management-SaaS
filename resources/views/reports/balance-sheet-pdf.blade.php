<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balance Sheet - {{ $company_name }}</title>
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
        .balance-sheet-container {
            display: table;
            width: 100%;
            margin-top: 20px;
        }
        .assets-column, .liabilities-column {
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
        .assets-title {
            background-color: #e3f2fd;
            border-color: #2196f3;
            color: #1976d2;
        }
        .liabilities-title {
            background-color: #f3e5f5;
            border-color: #9c27b0;
            color: #7b1fa2;
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
        .assets-total {
            color: #1976d2;
        }
        .liabilities-total {
            color: #7b1fa2;
        }
        .balance-check {
            margin-top: 30px;
            padding: 15px;
            text-align: center;
            border: 2px solid #4caf50;
            background-color: #e8f5e8;
            color: #2e7d32;
            font-weight: bold;
        }
        .balance-warning {
            border-color: #ff9800;
            background-color: #fff3e0;
            color: #e65100;
        }
        .currency {
            font-family: 'DejaVu Sans', sans-serif;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company_name }}</div>
        <div class="report-title">Balance Sheet</div>
        <div class="date-range">As at {{ $month_name }} {{ $year }}</div>
    </div>

    <div class="balance-sheet-container">
        <div class="assets-column">
            <div class="section-title assets-title">ASSETS</div>
            <table>
                <tbody>
                    <!-- Current Assets -->
                    <tr style="background-color: #f5f5f5;">
                        <td><strong>Current Assets</strong></td>
                        <td class="amount"></td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Cash at Bank</td>
                        <td class="amount currency">Tk {{ number_format($assets['current_assets']['cash_at_bank'], 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Stock/Inventory</td>
                        <td class="amount currency">Tk {{ number_format($assets['current_assets']['stock_value'], 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Customer Due</td>
                        <td class="amount currency">Tk {{ number_format($assets['current_assets']['customer_due'], 2) }}</td>
                    </tr>
                    <tr style="background-color: #e8f4fd; font-weight: bold;">
                        <td>Total Current Assets</td>
                        <td class="amount currency"><strong>Tk {{ number_format($assets['current_assets']['total'], 2) }}</strong></td>
                    </tr>                    <!-- Fixed Assets -->
                    <tr style="background-color: #f5f5f5;">
                        <td><strong>Fixed Assets</strong></td>
                        <td class="amount"></td>
                    </tr>
                    @foreach($assets['fixed_assets']['items'] as $asset)
                    <tr>
                        <td style="padding-left: 20px;">{{ $asset['name'] }}</td>
                        <td class="amount currency">Tk {{ number_format($asset['value'], 2) }}</td>
                    </tr>
                    @endforeach
                    <tr style="background-color: #e3f2fd;">
                        <td style="padding-left: 20px;"><strong>Total Fixed Assets</strong></td>
                        <td class="amount currency"><strong>Tk {{ number_format($assets['fixed_assets']['total'], 2) }}</strong></td>
                    </tr>

                    <tr class="total-row assets-total">
                        <td><strong>TOTAL ASSETS</strong></td>
                        <td class="amount currency"><strong>Tk {{ number_format($assets['total_assets'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="liabilities-column">
            <div class="section-title liabilities-title">LIABILITIES & EQUITY</div>
            <table>
                <tbody>
                    <!-- Liabilities -->
                    <tr style="background-color: #f5f5f5;">
                        <td><strong>Liabilities</strong></td>
                        <td class="amount"></td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Accounts Payable</td>
                        <td class="amount currency">Tk {{ number_format($liabilities_equity['liabilities']['accounts_payable'], 2) }}</td>
                    </tr>
                    <tr style="background-color: #f3e5f5;">
                        <td style="padding-left: 20px;"><strong>Total Liabilities</strong></td>
                        <td class="amount currency"><strong>Tk {{ number_format($liabilities_equity['liabilities']['total'], 2) }}</strong></td>
                    </tr>

                    <!-- Equity -->
                    <tr style="background-color: #f5f5f5;">
                        <td><strong>Equity</strong></td>
                        <td class="amount"></td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Opening Capital</td>
                        <td class="amount currency">Tk {{ number_format($liabilities_equity['equity']['opening_capital'], 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Net Profit</td>
                        <td class="amount currency {{ $liabilities_equity['equity']['net_profit'] >= 0 ? '' : 'text-red' }}">
                            Tk {{ number_format($liabilities_equity['equity']['net_profit'], 2) }}
                        </td>
                    </tr>
                    <tr style="background-color: #f3e5f5;">
                        <td style="padding-left: 20px;"><strong>Total Equity</strong></td>
                        <td class="amount currency"><strong>Tk {{ number_format($liabilities_equity['equity']['total'], 2) }}</strong></td>
                    </tr>

                    <tr class="total-row liabilities-total">
                        <td><strong>TOTAL LIABILITIES & EQUITY</strong></td>
                        <td class="amount currency"><strong>Tk {{ number_format($liabilities_equity['total_liabilities_equity'], 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    @php
        $difference = abs($assets['total_assets'] - $liabilities_equity['total_liabilities_equity']);
        $isBalanced = $difference < 0.01;
    @endphp

    <div class="balance-check {{ $isBalanced ? '' : 'balance-warning' }}">
        @if($isBalanced)
            ✓ Balance Sheet is Balanced - Assets equal Liabilities & Equity
        @else
            ⚠ Balance Sheet is NOT Balanced - Difference: Tk {{ number_format($difference, 2) }}
        @endif
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #666;">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
