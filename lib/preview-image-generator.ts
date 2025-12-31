/**
 * Preview image generator for the calculator page.
 * Generates DMG-style parchment preview images using canvas.
 */

/**
 * Attribute to display in the preview image
 */
export interface PreviewAttribute {
  key: string;
  label: string;
  value: string;
}

/**
 * Input data needed to generate the preview image
 */
export interface PreviewImageInput {
  displayName: string;
  typeLine: string;
  description: string;
  attributes: PreviewAttribute[];
  hiddenAttributeKeys: Set<string>;
  suggestedRarity: string;
  combatScore: number;
}

/**
 * Generate a DMG-style parchment preview image.
 * Returns the data URL of the generated image, or null if generation failed.
 */
export function generatePreviewImage(
  canvas: HTMLCanvasElement,
  input: PreviewImageInput
): string | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // DMG-style colors
  const parchment = '#f4e4bc';
  const headerRed = '#58180D';
  const bodyText = '#1a1a1a';
  const accentGold = '#c9ad6a';

  const width = 400;
  const padding = 24;

  // Filter visible attributes
  const visibleAttrs = input.attributes.filter(attr => !input.hiddenAttributeKeys.has(attr.key));

  // Calculate dynamic height based on content
  let contentHeight = 0;
  contentHeight += 36; // Name
  contentHeight += 20; // Type line
  contentHeight += 16; // Spacing after header
  contentHeight += visibleAttrs.length * 22; // Attributes
  if (visibleAttrs.length > 0) contentHeight += 12; // Spacing after attributes
  if (input.description.trim()) {
    // Estimate description lines
    ctx.font = '13px Georgia, serif';
    const words = input.description.split(' ');
    let lineCount = 1;
    let testLine = '';
    for (const word of words) {
      const test = testLine + word + ' ';
      if (testLine && ctx.measureText(test).width > width - padding * 2 - 10) {
        lineCount++;
        testLine = word + ' ';
      } else {
        testLine = test;
      }
    }
    contentHeight += lineCount * 18 + 8;
  }
  contentHeight += 36; // Score badge

  const height = Math.max(200, contentHeight + padding * 2 + 20);
  canvas.width = width;
  canvas.height = height;

  // Parchment background
  ctx.fillStyle = parchment;
  ctx.fillRect(0, 0, width, height);

  // Add subtle texture/grain effect
  ctx.fillStyle = 'rgba(139, 119, 85, 0.03)';
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, 1, 1);
  }

  // Simple border
  ctx.strokeStyle = headerRed;
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  let y = padding + 8;

  // Item Name - Large, in header red
  ctx.fillStyle = headerRed;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(input.displayName, padding, y);
  y += 24;

  // Type line - Italic
  ctx.fillStyle = bodyText;
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText(input.typeLine, padding, y);
  y += 20;

  // Red decorative line under header
  ctx.strokeStyle = headerRed;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  y += 16;

  // Attributes
  ctx.textAlign = 'left';
  for (const attr of visibleAttrs) {
    // Bullet
    ctx.fillStyle = bodyText;
    ctx.font = '13px Georgia, serif';
    ctx.fillText('•', padding + 4, y);

    // Bold label
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText(`${attr.label}.`, padding + 18, y);
    const labelWidth = ctx.measureText(`${attr.label}. `).width;

    // Value
    ctx.font = '13px Georgia, serif';
    const maxValueWidth = width - padding * 2 - 18 - labelWidth - 8;
    let valueText = attr.value;
    if (ctx.measureText(valueText).width > maxValueWidth) {
      while (ctx.measureText(valueText + '...').width > maxValueWidth && valueText.length > 0) {
        valueText = valueText.slice(0, -1);
      }
      valueText += '...';
    }
    ctx.fillText(valueText, padding + 18 + labelWidth + 4, y);
    y += 20;
  }

  // Description
  if (input.description.trim()) {
    y += 4;
    ctx.fillStyle = bodyText;
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'left';

    // Word wrap description
    const words = input.description.split(' ');
    let line = '';
    const maxWidth = width - padding * 2 - 10;

    for (const word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), padding + 4, y);
        line = word + ' ';
        y += 18;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), padding + 4, y);
      y += 18;
    }
  }

  // Bottom section with rarity and score
  y = height - padding - 24;

  // Gold accent line
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  y += 18;

  // Rarity and Score on same line
  ctx.fillStyle = headerRed;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(input.suggestedRarity.toUpperCase(), padding, y);

  ctx.fillStyle = '#666';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${input.combatScore.toFixed(1)} pts`, width - padding, y);

  // Generate image URL
  return canvas.toDataURL('image/png');
}
