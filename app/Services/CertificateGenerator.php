<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class CertificateGenerator
{
    /**
     * Generates a certificate PDF by overlaying text on the template image.
     * Builds HTML directly (no Blade view) to avoid caching issues.
     */
    public function generate($templatePath, $config, $data, $outputPath)
    {
        // Ensure output directory exists
        $directory = dirname($outputPath);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        // ✅ BULLETPROOF: Force convert $config to an Array
        if (is_string($config)) {
            $config = json_decode($config, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid JSON in certificate config: " . json_last_error_msg());
            }
        }
        
        if (!is_array($config)) {
            throw new \Exception("Certificate configuration must be an array");
        }

        // Load image dimensions
        $manager = new ImageManager(new Driver());
        $image = $manager->read($templatePath);
        $width = $image->width();
        $height = $image->height();
        
        // Convert template to base64 for embedding in HTML
        $templateBase64 = base64_encode(file_get_contents($templatePath));
        $templateMime = mime_content_type($templatePath);
        $templateDataUri = "data:{$templateMime};base64,{$templateBase64}";

        // ✅ Build HTML directly in PHP (no Blade view = no caching issues)
        $htmlFields = '';
        foreach ($config as $fieldName => $fieldPos) {
            if (is_array($fieldPos) && isset($data[$fieldName]) && !empty($data[$fieldName])) {
                $x = $fieldPos['x'] ?? 0;
                $y = $fieldPos['y'] ?? 0;
                $size = $fieldPos['size'] ?? 24;
                $color = $fieldPos['color'] ?? '#000000';
                $align = $fieldPos['align'] ?? 'left';
                
                // Calculate transform for alignment
                $transform = 'translate(0, 0)';
                if ($align === 'center') {
                    $transform = 'translate(-50%, 0)';
                } elseif ($align === 'right') {
                    $transform = 'translate(-100%, 0)';
                }
                
                $htmlFields .= sprintf(
                    '<div class="certificate-field" style="left: %dpx; top: %dpx; font-size: %dpx; color: %s; text-align: %s; transform: %s;">%s</div>',
                    $x,
                    $y,
                    $size,
                    htmlspecialchars($color),
                    $align,
                    $transform,
                    htmlspecialchars($data[$fieldName])
                );
            }
        }

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { margin: 0; padding: 0; font-family: DejaVu Sans, sans-serif; }
        .certificate-container { position: relative; width: {$width}px; height: {$height}px; }
        .certificate-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .certificate-field { position: absolute; white-space: nowrap; }
    </style>
</head>
<body>
    <div class="certificate-container">
        <img class="certificate-bg" src="{$templateDataUri}" alt="Certificate Template">
        {$htmlFields}
    </div>
</body>
</html>
HTML;

        // Generate PDF using DomPDF
        $pdf = Pdf::loadHTML($html)
            ->setPaper([0, 0, $width, $height], 'portrait')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true);

        // Save PDF to file
        $pdf->save($outputPath);

        return $outputPath;
    }
}