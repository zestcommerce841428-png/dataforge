$env:VERCEL_TOKEN = $null  # use stored auth

$vars = @(
  @{ name="SUPABASE_SERVICE_ROLE_KEY"; env="development"; value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdHdwdGR5aWJpeGt3em1vZmRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI4NTUwNywiZXhwIjoyMDk2ODYxNTA3fQ.JFkDYK5RVGLMi6oDvDKSosTcCpKKzropm2evWYEX4II" },
  @{ name="NEXT_PUBLIC_HOSTINGER_UPLOAD_URL"; env="production"; value="https://api.zestcommerce.in/api1/upload.php" },
  @{ name="NEXT_PUBLIC_HOSTINGER_UPLOAD_URL"; env="development"; value="https://api.zestcommerce.in/api1/upload.php" },
  @{ name="HOSTINGER_UPLOAD_SECRET"; env="production"; value="zSc2wDCeqvluAJHhRkZQYKgWpBbn8aXrjmIidEx1P4OMsVTL" },
  @{ name="HOSTINGER_UPLOAD_SECRET"; env="development"; value="zSc2wDCeqvluAJHhRkZQYKgWpBbn8aXrjmIidEx1P4OMsVTL" }
)

foreach ($v in $vars) {
  Write-Host "Adding $($v.name) to $($v.env)..."
  vercel env add $v.name $v.env --value $v.value --yes
  Write-Host "Done."
}
Write-Host "ALL COMPLETE"
