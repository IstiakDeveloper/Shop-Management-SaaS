<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Analysis Report - {{ $company_name }}</title>
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
        .date-range {
            font-size: 10px;
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
        .product-name {
            text-align: left;
            max-width: 120px;
            word-wrap: break-word;
        }
        .number-cell {
            text-align: right;
        }
        .currency {
            font-family: 'DejaVu Sans', sans-serif;
        }
        .profit-positive {
            color: #2e7d32;
            font-weight: bold;
        }
        .profit-negative {
            color: #c62828;
            font-weight: bold;
        }
        .summary-section {
            margin-top: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
        }
        .summary-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
        }
        .summary-stats {
            display: table;
            width: 100%;
        }
        .summary-item {
            display: table-cell;
            width: 25%;
            text-align: center;
            padding: 5px;
        }
        .summary-label {
            font-size: 8px;
            color: #666;
        }
        .summary-value {
            font-size: 11px;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company_name }}</div>
        <div class="report-title">Product Analysis Report</div>
        <div class="date-range">{{ $start_date }} to {{ $end_date }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="product-name">Product Name</th>
                <th style="width: 10%;">Category</th>
                <th style="width: 8%;">Stock Qty</th>
                <th style="width: 10%;">Avg Purchase</th>
                <th style="width: 8%;">Sold Qty</th>
                <th style="width: 10%;">Avg Sale</th>
                <th style="width: 10%;">Total Sale</th>
                <th style="width: 10%;">Total Cost</th>
                <th style="width: 10%;">Profit/Loss</th>
                <th style="width: 8%;">Margin %</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr>
                <td class="product-name">{{ $product['name'] }}</td>
                <td>{{ $product['category'] ?? 'N/A' }}</td>
                <td class="number-cell">{{ number_format($product['current_stock'] ?? 0) }}</td>
                <td class="number-cell currency">Tk {{ number_format($product['avg_purchase_price'] ?? 0, 2) }}</td>
                <td class="number-cell">{{ number_format($product['total_sold'] ?? 0) }}</td>
                <td class="number-cell currency">Tk {{ number_format($product['avg_sale_price'] ?? 0, 2) }}</td>
                <td class="number-cell currency">Tk {{ number_format($product['total_sale_amount'] ?? 0, 2) }}</td>
                <td class="number-cell currency">Tk {{ number_format($product['total_cost'] ?? 0, 2) }}</td>
                                <td class="number-cell currency profit-cell {{ $product['profit'] >= 0 ? 'positive' : 'negative' }}">
                    Tk {{ number_format($product['profit'] ?? 0, 2) }}
                </td>
                <td class="number-cell {{ ($product['margin_percentage'] ?? 0) >= 0 ? 'profit-positive' : 'profit-negative' }}">
                    {{ number_format($product['margin_percentage'] ?? 0, 1) }}%
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-section">
        <div class="summary-title">SUMMARY</div>
        <div class="summary-stats">
            <div class="summary-item">
                <div class="summary-label">Total Products</div>
                <div class="summary-value">{{ count($products) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Sale Amount</div>
                <div class="summary-value currency">Tk {{ number_format(collect($products)->sum('total_sale_amount'), 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Cost</div>
                <div class="summary-value currency">Tk {{ number_format(collect($products)->sum('total_cost'), 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Profit</div>
                <div class="summary-value currency {{ collect($products)->sum('profit') >= 0 ? 'profit-positive' : 'profit-negative' }}">
                    Tk {{ number_format(collect($products)->sum('profit'), 2) }}</div>
                </div>
            </div>
        </div>
    </div>

    <div style="margin-top: 30px; text-align: center; font-size: 8px; color: #666;">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
