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
            background-color: #e5e7eb;
            color: #000;
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
            width: 20%;
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
                <th rowspan="2" style="width: 3%;">SL</th>
                <th rowspan="2" class="product-name" style="width: 12%;">NAME</th>
                <th colspan="3" style="border-left: 2px solid #000;">BEFORE STOCK INFORMATION</th>
                <th colspan="3" style="border-left: 2px solid #000;">BUY INFORMATION</th>
                <th colspan="5" style="border-left: 2px solid #000;">SALE INFORMATION</th>
                <th colspan="2" style="border-left: 2px solid #000;">PROFIT INFORMATION</th>
                <th colspan="2" style="border-left: 2px solid #000;">AVAILABLE INFORMATION</th>
            </tr>
            <tr>
                <th style="border-left: 2px solid #000;">QTY</th>
                <th>PRICE</th>
                <th>VALUE</th>
                <th style="border-left: 2px solid #000;">QTY</th>
                <th>PRICE</th>
                <th>TOTAL</th>
                <th style="border-left: 2px solid #000;">QTY</th>
                <th>PRICE</th>
                <th>SUBTOTAL</th>
                <th>DISCOUNT</th>
                <th>TOTAL</th>
                <th style="border-left: 2px solid #000;">PER UNIT</th>
                <th>TOTAL</th>
                <th style="border-left: 2px solid #000;">STOCK</th>
                <th>VALUE</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalBeforeQty = 0;
                $totalBeforeValue = 0;
                $totalPurchaseQty = 0;
                $totalPurchaseValue = 0;
                $totalSaleQty = 0;
                $totalSaleSubtotal = 0;
                $totalSaleDiscount = 0;
                $totalSaleTotal = 0;
                $totalProfit = 0;
                $totalAvailableQty = 0;
                $totalAvailableValue = 0;
            @endphp
            @foreach($products as $index => $product)
            @php
                $beforeQty = $product['before_stock_qty'] ?? 0;
                $beforePrice = $product['before_stock_price'] ?? 0;
                $beforeValue = $product['before_stock_value'] ?? 0;
                $purchaseQty = $product['purchase_qty'] ?? 0;
                $purchasePrice = $product['purchase_price'] ?? 0;
                $purchaseTotal = $product['purchase_total'] ?? 0;
                $saleQty = $product['sale_qty'] ?? 0;
                $salePrice = $product['sale_price'] ?? 0;
                $saleSubtotal = $product['sale_subtotal'] ?? 0;
                $saleDiscount = $product['sale_discount'] ?? 0;
                $saleTotal = $product['sale_total'] ?? 0;
                $profitPerUnit = $product['profit_per_unit'] ?? 0;
                $profitTotal = $product['profit_total'] ?? 0;
                $availableStock = $product['available_stock'] ?? 0;
                $availableValue = $product['available_stock_value'] ?? 0;

                $totalBeforeQty += $beforeQty;
                $totalBeforeValue += $beforeValue;
                $totalPurchaseQty += $purchaseQty;
                $totalPurchaseValue += $purchaseTotal;
                $totalSaleQty += $saleQty;
                $totalSaleSubtotal += $saleSubtotal;
                $totalSaleDiscount += $saleDiscount;
                $totalSaleTotal += $saleTotal;
                $totalProfit += $profitTotal;
                $totalAvailableQty += $availableStock;
                $totalAvailableValue += $availableValue;
            @endphp
            <tr>
                <td>{{ $index + 1 }}</td>
                <td class="product-name">{{ $product['name'] }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($beforeQty, 0) }}</td>
                <td class="number-cell">{{ number_format($beforePrice, 2) }}</td>
                <td class="number-cell">{{ number_format($beforeValue, 2) }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($purchaseQty, 0) }}</td>
                <td class="number-cell">{{ number_format($purchasePrice, 2) }}</td>
                <td class="number-cell">{{ number_format($purchaseTotal, 2) }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($saleQty, 0) }}</td>
                <td class="number-cell">{{ number_format($salePrice, 2) }}</td>
                <td class="number-cell">{{ number_format($saleSubtotal, 2) }}</td>
                <td class="number-cell">{{ number_format($saleDiscount, 2) }}</td>
                <td class="number-cell">{{ number_format($saleTotal, 2) }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($profitPerUnit, 2) }}</td>
                <td class="number-cell">{{ number_format($profitTotal, 2) }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($availableStock, 0) }}</td>
                <td class="number-cell">{{ number_format($availableValue, 2) }}</td>
            </tr>
            @endforeach
            <tr style="background-color: #d1d5db; font-weight: bold; border-top: 2px solid #000;">
                <td colspan="2">TOTAL</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($totalBeforeQty, 0) }}</td>
                <td class="number-cell">-</td>
                <td class="number-cell">{{ number_format($totalBeforeValue, 2) }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($totalPurchaseQty, 0) }}</td>
                <td class="number-cell">-</td>
                <td class="number-cell">{{ number_format($totalPurchaseValue, 2) }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($totalSaleQty, 0) }}</td>
                <td class="number-cell">-</td>
                <td class="number-cell">{{ number_format($totalSaleSubtotal, 2) }}</td>
                <td class="number-cell">{{ number_format($totalSaleDiscount, 2) }}</td>
                <td class="number-cell">{{ number_format($totalSaleTotal, 2) }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">-</td>
                <td class="number-cell">{{ number_format($totalProfit, 2) }}</td>
                <td class="number-cell" style="border-left: 2px solid #000;">{{ number_format($totalAvailableQty, 0) }}</td>
                <td class="number-cell">{{ number_format($totalAvailableValue, 2) }}</td>
            </tr>
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
                <div class="summary-label">Total Purchase</div>
                <div class="summary-value">{{ number_format(collect($products)->sum('purchase_total'), 0) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Sale</div>
                <div class="summary-value">{{ number_format(collect($products)->sum('sale_total'), 0) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Profit</div>
                <div class="summary-value">{{ number_format(collect($products)->sum('profit_total'), 0) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Stock Value</div>
                <div class="summary-value">{{ number_format(collect($products)->sum('available_stock_value'), 0) }}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        Generated on {{ date('d M Y, h:i A') }}
    </div>
</body>
</html>
