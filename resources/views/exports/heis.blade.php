<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Higher Education Institutions – Region XII</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a1a1a; }
        header { border-bottom: 3px solid #0032a0; margin-bottom: 12px; padding-bottom: 8px; }
        header p { margin: 0; }
        .agency { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #555; }
        h1 { margin: 2px 0; font-size: 16px; color: #0032a0; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0032a0; color: #fff; text-align: left; padding: 6px; }
        td { border-bottom: 1px solid #ddd; padding: 5px 6px; vertical-align: top; }
        tr:nth-child(even) td { background: #f5f7fb; }
        footer { margin-top: 10px; font-size: 8px; color: #777; }
    </style>
</head>
<body>
    <header>
        <p class="agency">Commission on Higher Education · Regional Office XII</p>
        <h1>Higher Education Institutions in Region XII</h1>
        <p>{{ $institutions->count() }} institutions · Generated {{ $generatedAt->format('F j, Y g:i A') }}</p>
    </header>

    <table>
        <thead>
            <tr>
                <th style="width: 4%">#</th>
                <th style="width: 34%">Institution</th>
                <th style="width: 18%">Type</th>
                <th style="width: 18%">City / Municipality</th>
                <th style="width: 26%">Province</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($institutions as $institution)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $institution['name'] }}</td>
                    <td>{{ $institution['type'] ?? '—' }}</td>
                    <td>{{ $institution['city'] ?? '—' }}</td>
                    <td>{{ $institution['province'] ?? '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <footer>Source: CHED Regional Office XII portal. For the official list, please contact the office.</footer>
</body>
</html>
