Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Yousif\.gemini\antigravity-ide\brain\f9260a18-0704-4f7e-869a-66497f9e1e11\.user_uploaded\media_1791737287728.jpg"
$assetsDir = "c:\Users\Yousif\Desktop\NeonShift\neonshift-expo\assets"

if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image {
    param (
        [System.Drawing.Image]$source,
        [int]$targetWidth,
        [int]$targetHeight,
        [string]$outputPath,
        [float]$scale = 1.0,
        [System.Drawing.Color]$bgColor = [System.Drawing.Color]::Transparent
    )

    $bmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($bgColor -ne [System.Drawing.Color]::Transparent) {
        $brush = New-Object System.Drawing.SolidBrush($bgColor)
        $gfx.FillRectangle($brush, 0, 0, $targetWidth, $targetHeight)
        $brush.Dispose()
    } else {
        $gfx.Clear([System.Drawing.Color]::Transparent)
    }

    $destW = [int]($targetWidth * $scale)
    $destH = [int]($targetHeight * $scale)
    $destX = [int](($targetWidth - $destW) / 2)
    $destY = [int](($targetHeight - $destH) / 2)

    $gfx.DrawImage($source, $destX, $destY, $destW, $destH)
    $gfx.Dispose()

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Generated: $outputPath ($targetWidth x $targetHeight)"
}

# 1. Main App Icon (1024x1024)
Resize-Image -source $srcImg -targetWidth 1024 -targetHeight 1024 -outputPath "$assetsDir\icon.png"

# 2. Google Play Store Icon (512x512)
Resize-Image -source $srcImg -targetWidth 512 -targetHeight 512 -outputPath "$assetsDir\google-play-icon.png"
Copy-Item "$assetsDir\google-play-icon.png" "$assetsDir\playstore-icon-512.png" -Force

# 3. Android Adaptive Foreground Icon (1024x1024 with 72% safe zone for squircle/circle masks)
Resize-Image -source $srcImg -targetWidth 1024 -targetHeight 1024 -outputPath "$assetsDir\android-icon-foreground.png" -scale 0.72

# 4. Android Adaptive Background (1024x1024 cyber dark matching #06060F)
$darkBgColor = [System.Drawing.Color]::FromArgb(255, 6, 6, 15)
$bgBmp = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bgGfx = [System.Drawing.Graphics]::FromImage($bgBmp)
$bgBrush = New-Object System.Drawing.SolidBrush($darkBgColor)
$bgGfx.FillRectangle($bgBrush, 0, 0, 1024, 1024)
$bgBrush.Dispose()
$bgGfx.Dispose()
$bgBmp.Save("$assetsDir\android-icon-background.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bgBmp.Dispose()
Write-Output "Generated: $assetsDir\android-icon-background.png (1024 x 1024)"

# 5. Splash Screen Icon (1024x1024 centered)
Resize-Image -source $srcImg -targetWidth 1024 -targetHeight 1024 -outputPath "$assetsDir\splash-icon.png" -scale 0.75

# 6. Full Splash Screen (1242x2436 portrait)
$splashBmp = New-Object System.Drawing.Bitmap(1242, 2436, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$splashGfx = [System.Drawing.Graphics]::FromImage($splashBmp)
$splashGfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$splashGfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$splashGfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$splashGfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$splashBrush = New-Object System.Drawing.SolidBrush($darkBgColor)
$splashGfx.FillRectangle($splashBrush, 0, 0, 1242, 2436)
$splashBrush.Dispose()

# Draw logo centered in upper-middle of splash
$logoSize = 850
$logoX = [int]((1242 - $logoSize) / 2)
$logoY = [int]((2436 - $logoSize) / 2 - 120)
$splashGfx.DrawImage($srcImg, $logoX, $logoY, $logoSize, $logoSize)
$splashGfx.Dispose()
$splashBmp.Save("$assetsDir\splash.png", [System.Drawing.Imaging.ImageFormat]::Png)
$splashBmp.Dispose()
Write-Output "Generated: $assetsDir\splash.png (1242 x 2436)"

# 7. Favicon (48x48)
Resize-Image -source $srcImg -targetWidth 48 -targetHeight 48 -outputPath "$assetsDir\favicon.png"

# 8. Android Adaptive Monochrome Icon (white silhouette for Android 13+)
$monoBmp = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$monoGfx = [System.Drawing.Graphics]::FromImage($monoBmp)
$monoGfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$monoGfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$monoGfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$monoGfx.Clear([System.Drawing.Color]::Transparent)

# Draw icon at 65% scale in center
$mSize = [int](1024 * 0.65)
$mX = [int]((1024 - $mSize) / 2)
$mY = [int]((1024 - $mSize) / 2)
$monoGfx.DrawImage($srcImg, $mX, $mY, $mSize, $mSize)
$monoGfx.Dispose()

# Convert non-transparent pixels to soft white/light gray
for ($y = 0; $y -lt 1024; $y += 2) {
    for ($x = 0; $x -lt 1024; $x += 2) {
        $p = $monoBmp.GetPixel($x, $y)
        if ($p.A -gt 30) {
            $lum = [int](($p.R * 0.299 + $p.G * 0.587 + $p.B * 0.114))
            if ($lum -gt 40) {
                $whiteCol = [System.Drawing.Color]::FromArgb($p.A, 255, 255, 255)
                $monoBmp.SetPixel($x, $y, $whiteCol)
                if ($x+1 -lt 1024) { $monoBmp.SetPixel($x+1, $y, $whiteCol) }
                if ($y+1 -lt 1024) { $monoBmp.SetPixel($x, $y+1, $whiteCol) }
                if ($x+1 -lt 1024 -and $y+1 -lt 1024) { $monoBmp.SetPixel($x+1, $y+1, $whiteCol) }
            }
        }
    }
}
$monoBmp.Save("$assetsDir\android-icon-monochrome.png", [System.Drawing.Imaging.ImageFormat]::Png)
$monoBmp.Dispose()
Write-Output "Generated: $assetsDir\android-icon-monochrome.png (1024 x 1024)"

$srcImg.Dispose()
Write-Output "All Joeshift App, Launch, Splash, and Google Play Assets Generated Successfully!"
