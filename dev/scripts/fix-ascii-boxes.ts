import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Fixes ASCII box character alignment in documentation files
 * Handles multiple box styles: ┏━┓/┗━┛ and ┌─┐/└─┘
 * Preserves content, titles, and nested structures
 * Optimized for Bun runtime
 */

interface BoxStyle {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
}

interface BoxRegion {
  startLine: number;
  endLine: number;
  indent: number;
  width: number;
  style: BoxStyle;
  content: string[];
}

const BOX_STYLES = {
  heavy: {
    topLeft: "┏",
    topRight: "┓",
    bottomLeft: "┗",
    bottomRight: "┛",
    horizontal: "━",
    vertical: "┃",
  },
  light: {
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
    horizontal: "─",
    vertical: "│",
  },
  double: {
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
    horizontal: "═",
    vertical: "║",
  },
} as const;

class AsciiBoxFixer {
  private fileContent: string;
  private lines: string[];

  constructor(filePath: string) {
    this.fileContent = fs.readFileSync(filePath, "utf-8");
    this.lines = this.fileContent.split("\n");
  }

  /**
   * Detect box style from a border line
   */
  private detectBoxStyle(line: string): BoxStyle | null {
    if (/[┏┓┗┛━┃]/.test(line)) return BOX_STYLES.heavy;
    if (/[┌┐└┘─│]/.test(line)) return BOX_STYLES.light;
    if (/[╔╗╚╝═║]/.test(line)) return BOX_STYLES.double;
    return null;
  }

  /**
   * Check if line is a top border (with or without title)
   */
  private isTopBorder(line: string): boolean {
    return /^[\s]*[┏┌╔][━─═]+[┓┐╗][\s]*$/.test(line) ||
           /^[\s]*[┏┌╔][━─═]+\s+.+?\s+[━─═]+[┓┐╗][\s]*$/.test(line);
  }

  /**
   * Check if line is a bottom border
   */
  private isBottomBorder(line: string): boolean {
    return /^[\s]*[┗└╚][━─═]+[┛┘╝][\s]*$/.test(line);
  }

  /**
   * Extract title from a titled border line
   */
  private extractTitle(line: string): string | null {
    const match = line.match(/[┏┌╔][━─═]+\s+(.+?)\s+[━─═]+[┓┐╗]/);
    return match ? match[1] : null;
  }

  /**
   * Calculate the actual content width needed
   */
  private calculateContentWidth(lines: string[]): number {
    let maxWidth = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip border lines
      if (this.isTopBorder(trimmed) || this.isBottomBorder(trimmed)) continue;
      
      // Remove side borders and measure content
      const content = trimmed.replace(/^[│┃║]\s*/, "").replace(/\s*[│┃║]$/, "");
      maxWidth = Math.max(maxWidth, content.length);
    }
    
    return maxWidth;
  }

  /**
   * Find all box regions in the file
   */
  private findBoxRegions(): BoxRegion[] {
    const regions: BoxRegion[] = [];
    let inBox = false;
    let boxStartLine = 0;
    let boxIndent = 0;
    let boxStyle: BoxStyle | null = null;
    let boxLines: string[] = [];

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];

      if (!inBox && this.isTopBorder(line)) {
        inBox = true;
        boxStartLine = i;
        boxLines = [line];
        boxStyle = this.detectBoxStyle(line);
        
        // Calculate indent
        const match = line.match(/^(\s*)/);
        boxIndent = match ? match[1].length : 0;
      } else if (inBox) {
        boxLines.push(line);

        if (this.isBottomBorder(line)) {
          if (boxStyle) {
            // Calculate width from content
            const contentWidth = this.calculateContentWidth(boxLines);
            const totalWidth = Math.max(contentWidth + 4, 80); // Min 80 chars

            regions.push({
              startLine: boxStartLine,
              endLine: i,
              indent: boxIndent,
              width: totalWidth,
              style: boxStyle,
              content: boxLines,
            });
          }

          inBox = false;
          boxLines = [];
          boxStyle = null;
        }
      }
    }

    return regions;
  }

  /**
   * Fix alignment for a single box region
   */
  private fixBoxRegion(region: BoxRegion): string[] {
    const fixed: string[] = [];
    const indent = " ".repeat(region.indent);
    const { style } = region;

    for (let i = 0; i < region.content.length; i++) {
      const line = region.content[i];

      if (i === 0) {
        // Top border (with or without title)
        const title = this.extractTitle(line);
        fixed.push(this.createBorderLine(indent, region.width, style, "top", title));
      } else if (i === region.content.length - 1) {
        // Bottom border
        fixed.push(this.createBorderLine(indent, region.width, style, "bottom"));
      } else {
        // Content line
        fixed.push(this.fixContentLine(line, indent, region.width, style));
      }
    }

    return fixed;
  }

  /**
   * Create a border line (top or bottom, with optional title)
   */
  private createBorderLine(
    indent: string,
    width: number,
    style: BoxStyle,
    position: "top" | "bottom",
    title?: string | null
  ): string {
    const left = position === "top" ? style.topLeft : style.bottomLeft;
    const right = position === "top" ? style.topRight : style.bottomRight;
    const fill = style.horizontal;

    if (title && position === "top") {
      // Create titled border: ┏━━ Title ━━┓
      const titleWithSpaces = `  ${title}  `;
      const remainingWidth = width - 2 - titleWithSpaces.length;
      const leftFill = Math.floor(remainingWidth / 2);
      const rightFill = remainingWidth - leftFill;
      
      return indent + left + fill.repeat(leftFill) + titleWithSpaces + 
             fill.repeat(rightFill) + right;
    }

    // Regular border
    const fillCount = Math.max(0, width - 2);
    return indent + left + fill.repeat(fillCount) + right;
  }

  /**
   * Fix content line alignment
   */
  private fixContentLine(line: string, indent: string, width: number, style: BoxStyle): string {
    const trimmed = line.trim();
    
    // Handle empty lines
    if (!trimmed || trimmed === style.vertical || trimmed === `${style.vertical}${style.vertical}`) {
      const innerWidth = width - 4;
      return `${indent}${style.vertical} ${" ".repeat(innerWidth)} ${style.vertical}`;
    }

    // Extract content (remove borders)
    const content = trimmed
      .replace(new RegExp(`^[${style.vertical}]\\s*`), "")
      .replace(new RegExp(`\\s*[${style.vertical}]$`), "");

    // Preserve original spacing for indented content
    const innerWidth = width - 4;
    const paddedContent = content.padEnd(innerWidth, " ");

    return `${indent}${style.vertical} ${paddedContent} ${style.vertical}`;
  }

  /**
   * Main fix method
   */
  fix(): string {
    const regions = this.findBoxRegions();

    if (regions.length === 0) {
      console.log("ℹ No ASCII boxes found to fix");
      return this.fileContent;
    }

    console.log(`\n📦 Found ${regions.length} ASCII box region(s) to fix\n`);

    // Process regions in reverse order to maintain line numbers
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i];
      const fixedLines = this.fixBoxRegion(region);

      console.log(`  ✓ Fixed box at lines ${region.startLine + 1}-${region.endLine + 1} (${region.content.length} lines, width: ${region.width})`);

      // Replace lines in the original array
      this.lines.splice(
        region.startLine,
        region.endLine - region.startLine + 1,
        ...fixedLines
      );
    }

    return this.lines.join("\n");
  }

  /**
   * Write fixed content back to file
   */
  writeToFile(outputPath: string): void {
    const fixed = this.fix();
    fs.writeFileSync(outputPath, fixed, "utf-8");
    console.log(`\n✅ Fixed file written to: ${outputPath}\n`);
  }

  /**
   * Preview changes without writing
   */
  preview(): void {
    const regions = this.findBoxRegions();
    
    if (regions.length === 0) {
      console.log("ℹ No ASCII boxes found");
      return;
    }

    console.log(`\n📦 Preview: Found ${regions.length} box region(s)\n`);
    
    for (const region of regions) {
      console.log(`Box at lines ${region.startLine + 1}-${region.endLine + 1}:`);
      console.log(`  Style: ${region.style.topLeft}${region.style.horizontal}${region.style.topRight}`);
      console.log(`  Width: ${region.width} chars`);
      console.log(`  Indent: ${region.indent} spaces`);
      console.log(`  Lines: ${region.content.length}`);
      console.log();
    }
  }
}

/**
 * Process multiple files
 */
function processFiles(filePaths: string[], options: { preview?: boolean; backup?: boolean } = {}): void {
  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      continue;
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log(`📄 Processing: ${filePath}`);
    console.log("=".repeat(80));

    const fixer = new AsciiBoxFixer(filePath);

    if (options.preview) {
      fixer.preview();
    } else {
      // Create backup if requested
      if (options.backup) {
        const backupPath = `${filePath}.backup`;
        fs.copyFileSync(filePath, backupPath);
        console.log(`💾 Backup created: ${backupPath}`);
      }

      fixer.writeToFile(filePath);
    }
  }
}

/**
 * Process directory recursively
 */
function processDirectory(
  dirPath: string,
  pattern = /\.txt$/i,
  options: { preview?: boolean; backup?: boolean } = {}
): void {
  const files: string[] = [];

  function walkDir(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dirPath);

  if (files.length === 0) {
    console.log(`ℹ No matching files found in: ${dirPath}`);
    return;
  }

  console.log(`\n📁 Found ${files.length} file(s) to process\n`);
  processFiles(files, options);
}

// CLI Interface
const args = Bun.argv.slice(2);

if (args.length === 0) {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║          ASCII Box Alignment Fixer (Bun Runtime)                       ║
╚════════════════════════════════════════════════════════════════════════╝

Fixes ASCII box character alignment in documentation files.
Supports multiple box styles: ┏━┓/┗━┛, ┌─┐/└─┘, ╔═╗/╚═╝

Usage:
  bun run fix-ascii-boxes.ts [options] <file(s)>

Options:
  --preview              Preview changes without modifying files
  --backup               Create .backup files before modifying
  --dir <path>           Process all files in directory
  --pattern <regex>      File pattern to match (default: .txt$)
  --help                 Show this help message

Examples:
  bun run fix-ascii-boxes.ts file.txt
  bun run fix-ascii-boxes.ts --preview file.txt
  bun run fix-ascii-boxes.ts --backup file1.txt file2.txt
  bun run fix-ascii-boxes.ts --dir ./docs
  bun run fix-ascii-boxes.ts --dir ./docs --pattern '.*designs.*'

Supported Box Styles:
  Heavy:  ┏━━━┓  Light:  ┌───┐  Double:  ╔═══╗
          ┃   ┃          │   │           ║   ║
          ┗━━━┛          └───┘           ╚═══╝
`);
  process.exit(0);
}

// Parse options
const options = {
  preview: args.includes("--preview"),
  backup: args.includes("--backup"),
};

// Remove option flags from args
const fileArgs = args.filter(arg => !arg.startsWith("--"));

// Handle directory mode
if (args.includes("--dir")) {
  const dirIndex = args.indexOf("--dir");
  const dirPath = args[dirIndex + 1] || ".";
  
  let pattern = /\.txt$/i;
  if (args.includes("--pattern")) {
    const patternIndex = args.indexOf("--pattern");
    const patternStr = args[patternIndex + 1];
    if (patternStr) {
      pattern = new RegExp(patternStr);
    }
  }
  
  processDirectory(dirPath, pattern, options);
} else {
  // Process individual files
  if (fileArgs.length === 0) {
    console.error("❌ Error: No files specified\n");
    console.log("Run with --help for usage information");
    process.exit(1);
  }
  
  processFiles(fileArgs, options);
}

console.log("\n✨ Done!\n");
