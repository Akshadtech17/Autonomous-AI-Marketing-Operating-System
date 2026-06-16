import os
import logging
from datetime import datetime
from pathlib import Path
from config import settings

logger = logging.getLogger(__name__)

class PDFReportGenerator:
    def __init__(self):
        self.output_dir = Path(settings.REPORT_OUTPUT_DIR)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate(self, campaign: dict, agent_outputs: dict) -> str:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
            HRFlowable, PageBreak,
        )
        from reportlab.graphics.shapes import Drawing
        from reportlab.graphics.charts.barcharts import VerticalBarChart

        filename = f"report_{campaign['id']}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = self.output_dir / filename

        doc = SimpleDocTemplate(
            str(filepath),
            pagesize=A4,
            rightMargin=2*cm, leftMargin=2*cm,
            topMargin=2.5*cm, bottomMargin=2*cm,
        )

        styles = getSampleStyleSheet()
        dark_blue = colors.HexColor("#0f172a")
        accent = colors.HexColor("#6366f1")
        light_gray = colors.HexColor("#f1f5f9")

        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontSize=28, textColor=dark_blue,
            spaceAfter=6, fontName="Helvetica-Bold",
        )
        h1_style = ParagraphStyle(
            "H1", parent=styles["Heading1"],
            fontSize=18, textColor=accent,
            spaceAfter=8, spaceBefore=16, fontName="Helvetica-Bold",
        )
        h2_style = ParagraphStyle(
            "H2", parent=styles["Heading2"],
            fontSize=13, textColor=dark_blue,
            spaceAfter=6, spaceBefore=10, fontName="Helvetica-Bold",
        )
        body_style = ParagraphStyle(
            "Body", parent=styles["Normal"],
            fontSize=10, textColor=colors.HexColor("#334155"),
            spaceAfter=4, leading=16,
        )
        caption_style = ParagraphStyle(
            "Caption", parent=styles["Normal"],
            fontSize=8, textColor=colors.gray, italic=True,
        )

        story = []

        # ── Cover Page ──
        story.append(Spacer(1, 1*cm))
        story.append(Paragraph("LOST IN FRAME PRODUCTION", caption_style))
        story.append(Paragraph("Autonomous AI Marketing Report", title_style))
        story.append(HRFlowable(width="100%", thickness=2, color=accent))
        story.append(Spacer(1, 0.4*cm))

        meta_data = [
            ["Business", campaign.get("business_name", "—")],
            ["Industry", campaign.get("industry", "—")],
            ["Location", campaign.get("location", "—")],
            ["Campaign Goal", campaign.get("goal", "—")[:120]],
            ["Generated", datetime.utcnow().strftime("%d %B %Y, %H:%M UTC")],
            ["Campaign ID", campaign.get("id", "—")],
        ]
        meta_table = Table(meta_data, colWidths=[4*cm, 13*cm])
        meta_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), light_gray),
            ("TEXTCOLOR", (0, 0), (0, -1), dark_blue),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (1, 0), (1, -1), [colors.white, light_gray]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(meta_table)
        story.append(PageBreak())

        # ── Table of Contents placeholder ──
        story.append(Paragraph("Contents", h1_style))
        toc_items = [
            "1. Executive Summary",
            "2. Market Research",
            "3. SEO Strategy",
            "4. Content Marketing Plan",
            "5. Social Media Strategy",
            "6. Analytics & KPIs",
            "7. Creative Direction",
            "8. Report Summary",
        ]
        for item in toc_items:
            story.append(Paragraph(item, body_style))
        story.append(PageBreak())

        # ── Agent sections ──
        agent_sections = [
            ("research_agent", "1. Market Research"),
            ("seo_agent", "2. SEO Strategy"),
            ("content_agent", "3. Content Marketing Plan"),
            ("social_agent", "4. Social Media Strategy"),
            ("analytics_agent", "5. Analytics & KPI Framework"),
            ("creative_director_agent", "6. Creative Direction"),
            ("report_agent", "7. Executive Summary"),
        ]

        for agent_key, section_title in agent_sections:
            agent_data = agent_outputs.get(agent_key, {})
            story.append(Paragraph(section_title, h1_style))
            story.append(HRFlowable(width="100%", thickness=1, color=light_gray))
            story.append(Spacer(1, 0.2*cm))

            if agent_data:
                output_text = str(agent_data.get("output", "No output generated."))
                for para in output_text.split("\n"):
                    if para.strip():
                        story.append(Paragraph(para.strip()[:500], body_style))

                key_insights = agent_data.get("key_insights", [])
                if key_insights:
                    story.append(Paragraph("Key Insights", h2_style))
                    for insight in key_insights[:8]:
                        story.append(Paragraph(f"• {str(insight)[:300]}", body_style))

                confidence = agent_data.get("confidence_score")
                if confidence is not None:
                    story.append(Spacer(1, 0.2*cm))
                    story.append(Paragraph(
                        f"Confidence Score: {confidence:.0%}",
                        caption_style,
                    ))
            else:
                story.append(Paragraph("Data not yet available.", body_style))

            story.append(PageBreak())

        # ── KPI Chart ──
        story.append(Paragraph("Performance Forecast", h1_style))
        story.append(Spacer(1, 0.3*cm))
        drawing = Drawing(400, 200)
        bc = VerticalBarChart()
        bc.x = 50; bc.y = 30
        bc.width = 320; bc.height = 150
        bc.data = [(100, 180, 290, 410)]
        bc.categoryAxis.categoryNames = ["Month 1", "Month 2", "Month 3", "Month 4"]
        bc.bars[0].fillColor = accent
        drawing.add(bc)
        story.append(drawing)
        story.append(Paragraph("Projected monthly traffic growth", caption_style))
        story.append(PageBreak())

        # ── Footer page ──
        story.append(Spacer(1, 4*cm))
        story.append(HRFlowable(width="100%", thickness=2, color=accent))
        story.append(Spacer(1, 0.3*cm))
        story.append(Paragraph(
            "Generated by Lost In Frame Production — Autonomous AI Marketing OS",
            h2_style,
        ))
        story.append(Paragraph(
            f"Report generated on {datetime.utcnow().strftime('%d %B %Y')} | "
            f"Powered by Qwen3 8B + LLaMA 3.2",
            caption_style,
        ))

        doc.build(story)
        logger.info("PDF report generated: %s", filepath)
        return str(filepath)
