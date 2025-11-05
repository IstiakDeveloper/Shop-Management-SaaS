<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Analysis Report - {{ $tenant->name ?? 'Shop Management' }}</title>
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
        .date-range {
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
            padding: 2px;
            text-align: center;
        }
        th {
            background-color: #000;
            color: #fff;
            font-weight: bold;
            font-size: 7px;
        }
        .product-name {
            text-align: left;
            max-width: 80px;
            word-wrap: break-word;
        }
        .number-cell {
            text-align: right;
            font-family: 'DejaVu Sans', monospace;
        }
        .summary-section {
            margin-top: 12px;
            padding: 8px;
            background-color: #f0f0f0;
            border: 1px solid #000;
        }
        .summary-title {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 6px;
            text-align: center;
            text-transform: uppercase;
        }
        .summary-stats {
            display: table;
            width: 100%;
        }
        .summary-item {
            display: table-cell;
            width: 25%;
            text-align: center;
            padding: 4px;
        }
        .summary-label {
            font-size: 7px;
            color: #555;
        }
        .summary-value {
            font-size: 9px;
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
        <div class="report-title">Product Analysis Report</div>
        <div class="date-range">{{ $start_date }} to {{ $end_date }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="product-name">Product</th>
                <th style="width: 8%;">Category</th>
                <th style="width: 7%;">Stock</th>
                <th style="width: 9%;">Avg Buy</th>
                <th style="width: 7%;">Sold</th>
                <th style="width: 9%;">Avg Sale</th>
                <th style="width: 10%;">Sale Amt</th>
                <th style="width: 10%;">Cost</th>
                <th style="width: 10%;">Profit</th>
                <th style="width: 7%;">Margin</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr>
                <td class="product-name">{{ $product['name'] }}</td>
                <td>{{ $product['category'] ?? 'N/A' }}</td>
                <td class="number-cell">{{ number_format($product['current_stock'] ?? 0, 0) }}</td>
                <td class="number-cell">{{ number_format($product['avg_purchase_price'] ?? 0, 0) }}</td>
                <td class="number-cell">{{ number_format($product['total_sold'] ?? 0, 0) }}</td>
                <td class="number-cell">{{ number_format($product['avg_sale_price'] ?? 0, 0) }}</td>
                <td class="number-cell">{{ number_format($product['total_sale_amount'] ?? 0, 0) }}</td>
                <td class="number-cell">{{ number_format($product['total_cost'] ?? 0, 0) }}</td>
                <td class="number-cell">{{ number_format($product['profit'] ?? 0, 0) }}</td>
                <td class="number-cell">{{ number_format($product['margin_percentage'] ?? 0, 1) }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-section">
        <div class="summary-title">Summary</div>
        <div class="summary-stats">
            <div class="summary-item">
                <div class="summary-label">Total Products</div>
                <div class="summary-value">{{ count($products) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Sale</div>
                <div class="summary-value">{{ number_format(collect($products)->sum('total_sale_amount'), 0) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Cost</div>
                <div class="summary-value">{{ number_format(collect($products)->sum('total_cost'), 0) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Profit</div>
                <div class="summary-value">{{ number_format(collect($products)->sum('profit'), 0) }}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
