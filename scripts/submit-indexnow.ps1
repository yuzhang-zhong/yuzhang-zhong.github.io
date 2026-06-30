param(
  [string]$Endpoint = "https://api.indexnow.org/indexnow",
  [string]$HostName = "yuzhang-zhong.github.io",
  [string]$Key = "28395318164379037f7f883af866042e",
  [string]$KeyLocation = "https://yuzhang-zhong.github.io/28395318164379037f7f883af866042e.txt"
)

$ErrorActionPreference = "Stop"

$siteUrl = "https://$HostName"
$sitemapPath = Join-Path $PSScriptRoot "..\_site\sitemap.xml"

if (Test-Path $sitemapPath) {
  [xml]$sitemap = Get-Content $sitemapPath -Raw
  $urls = @($sitemap.urlset.url | ForEach-Object { $_.loc })
} else {
  $urls = @(
    "$siteUrl/",
    "$siteUrl/publications/",
    "$siteUrl/publication/2026-sns-grasp",
    "$siteUrl/portfolio/",
    "$siteUrl/sitemap/"
  )
}

$urls = $urls |
  Where-Object { $_ -and $_.StartsWith($siteUrl) } |
  Sort-Object -Unique

$body = @{
  host = $HostName
  key = $Key
  keyLocation = $KeyLocation
  urlList = $urls
} | ConvertTo-Json -Depth 4

$response = Invoke-WebRequest `
  -Uri $Endpoint `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body $body `
  -UseBasicParsing

[pscustomobject]@{
  StatusCode = $response.StatusCode
  Endpoint = $Endpoint
  SubmittedUrls = $urls
}
