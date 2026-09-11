package com.example.codebasearchaeologist.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfExportService {

    private static final float MARGIN = 50;
    private static final float FONT_SIZE = 11;
    private static final float LEADING = 16; // line spacing
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();

    public byte[] convertMarkdownToPdf(String markdownContent) throws IOException {
        try (PDDocument document = new PDDocument()) {

            PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            List<String> lines = wrapLines(markdownContent, font, FONT_SIZE, PAGE_WIDTH - 2 * MARGIN);

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDPageContentStream stream = new PDPageContentStream(document, page);
            stream.beginText();
            stream.setFont(font, FONT_SIZE);
            stream.newLineAtOffset(MARGIN, PAGE_HEIGHT - MARGIN);

            float currentY = PAGE_HEIGHT - MARGIN;

            for (String line : lines) {
                if (currentY <= MARGIN) {
                    // Current page is full — start a new one.
                    stream.endText();
                    stream.close();

                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    stream = new PDPageContentStream(document, page);
                    stream.beginText();
                    stream.setFont(font, FONT_SIZE);
                    currentY = PAGE_HEIGHT - MARGIN;
                    stream.newLineAtOffset(MARGIN, currentY);
                }

                boolean isHeading = line.startsWith("#");
                String cleanLine = line.replaceAll("^#+\\s*", "").replace("**", "");

                stream.setFont(isHeading ? boldFont : font, FONT_SIZE);
                stream.showText(sanitizeForPdf(cleanLine));
                stream.newLineAtOffset(0, -LEADING);
                currentY -= LEADING;
            }

            stream.endText();
            stream.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private String sanitizeForPdf(String text) {
        // PDFBox's built-in fonts only support a limited character set (WinAnsiEncoding).
        // Strip anything outside standard printable ASCII to avoid crashes on unusual characters.
        return text.replaceAll("[^\\x20-\\x7E]", "");
    }

    private List<String> wrapLines(String content, PDType1Font font, float fontSize, float maxWidth) throws IOException {
        List<String> result = new ArrayList<>();

        for (String rawLine : content.split("\n")) {
            if (rawLine.isBlank()) {
                result.add("");
                continue;
            }

            StringBuilder current = new StringBuilder();
            for (String word : rawLine.split(" ")) {
                String candidate = current.isEmpty() ? word : current + " " + word;
                float width = font.getStringWidth(sanitizeForPdf(candidate)) / 1000 * fontSize;

                if (width > maxWidth && !current.isEmpty()) {
                    result.add(current.toString());
                    current = new StringBuilder(word);
                } else {
                    current = new StringBuilder(candidate);
                }
            }
            result.add(current.toString());
        }

        return result;
    }
}