// Esta clase genera un PDF a partir del contenido del CV proporcionado por el
// usuario (OpenPDF) y extrae el texto de un .docx (Apache POI) para que el
// usuario pueda subir su CV base.
//
// El contenido del CV se espera en MARKDOWN ligero:
//   - Primera línea: "# Nombre Apellido" (o simplemente el nombre)
//   - Líneas de contacto justo debajo: "Email: ...", "Teléfono: ...", ...
//   - Secciones con "## TÍTULO" (o líneas cortas en MAYÚSCULAS)
//   - Subsecciones con "### Título"
//   - Puntos con "- " o "* "
//   - Negrita con "**texto**"
// Cualquier otro texto se renderiza como cuerpo normal.

package com.applyflow.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class CVService {

    private static final Logger log = LoggerFactory.getLogger(CVService.class);

    private static final Color COLOR_PRIMARY = new Color(0, 109, 119);
    private static final Color COLOR_SECONDARY = new Color(131, 197, 190);
    private static final Color COLOR_TEXTO = new Color(51, 65, 85);
    private static final Color COLOR_MUTED = new Color(100, 116, 139);
    private static final Color COLOR_BLANCO = Color.WHITE;

    private static final List<String> SECCIONES_CLAVE = List.of(
            "RESUMEN", "PERFIL", "EXPERIENCIA", "EDUCACIÓN", "EDUCACION",
            "FORMACIÓN", "FORMACION", "HABILIDADES", "SKILLS", "PROYECTOS",
            "IDIOMAS", "CONTACTO", "CERTIFICACIONES", "CERTIFICADOS", "LOGROS",
            "TECNOLOGÍAS", "TECNOLOGIAS", "SOBRE MI", "SOBRE MÍ",
            "DATOS DE CONTACTO", "DATOS PERSONALES", "OTROS", "CURSOS", "INTERESES");

    public byte[] generarPdfCv(String contenidoCv) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 48, 48, 50, 50);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontNombre = new Font(Font.HELVETICA, 25, Font.BOLD, COLOR_BLANCO);
            Font fontContacto = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(237, 246, 249));
            Font fontSeccion = new Font(Font.HELVETICA, 13, Font.BOLD, COLOR_PRIMARY);
            Font fontSubseccion = new Font(Font.HELVETICA, 11, Font.BOLD, COLOR_PRIMARY);
            Font fontCuerpo = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_TEXTO);
            Font fontCuerpoBold = new Font(Font.HELVETICA, 10, Font.BOLD, COLOR_TEXTO);
            Font fontBullet = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_TEXTO);
            Font fontContactoLinea = new Font(Font.HELVETICA, 9, Font.NORMAL, COLOR_MUTED);

            List<String> contactosCabecera = new ArrayList<>();
            String nombre = "";
            List<String> resto = new ArrayList<>();

            String[] lineas = contenidoCv.split("\\R");
            for (int i = 0; i < lineas.length; i++) {
                String linea = lineas[i].trim();
                if (linea.isEmpty()) {
                    continue;
                }
                if (nombre.isEmpty()) {
                    nombre = limpiarMarkdown(linea);
                    continue;
                }
                if (contactosCabecera.size() < 4 && i <= 10 && esContacto(linea)) {
                    contactosCabecera.add(limpiarContacto(linea));
                    continue;
                }
                resto.add(linea);
            }

            if (!nombre.isBlank()) {
                emitirCabecera(document, nombre, contactosCabecera, fontNombre, fontContacto);
            }

            for (String linea : resto) {
                if (esSubseccion(linea)) {
                    Paragraph pSub = new Paragraph(
                            limpiarMarkdown(linea).toUpperCase(), fontSubseccion);
                    pSub.setSpacingBefore(9);
                    pSub.setSpacingAfter(3);
                    document.add(pSub);
                } else if (esSeccion(linea)) {
                    Paragraph pSeccion = new Paragraph(
                            limpiarMarkdown(linea).toUpperCase(), fontSeccion);
                    pSeccion.setSpacingBefore(12);
                    pSeccion.setSpacingAfter(2);
                    document.add(pSeccion);

                    LineSeparator lineaDivisoria = new LineSeparator(
                            0.8f, 100f, COLOR_SECONDARY, Element.ALIGN_LEFT, -4);
                    document.add(new Chunk(lineaDivisoria));

                    Paragraph espacio = new Paragraph(" ");
                    espacio.setLeading(4f);
                    document.add(espacio);
                } else if (esContacto(linea)) {
                    Paragraph pContacto = new Paragraph();
                    pContacto.setSpacingAfter(4);
                    addTextoConNegrita(pContacto, linea, fontContactoLinea, fontContactoLinea);
                    document.add(pContacto);
                } else if (esBullet(linea)) {
                    String textoBullet = linea.substring(1).trim();
                    Paragraph pBullet = new Paragraph();
                    pBullet.setIndentationLeft(14);
                    pBullet.setSpacingAfter(3);
                    pBullet.setLeading(14f);
                    pBullet.add(new Chunk("▪  ", fontBullet));
                    addTextoConNegrita(pBullet, textoBullet, fontCuerpo, fontCuerpoBold);
                    document.add(pBullet);
                } else {
                    Paragraph pCuerpo = new Paragraph();
                    pCuerpo.setSpacingAfter(5);
                    pCuerpo.setLeading(14f);
                    addTextoConNegrita(pCuerpo, linea, fontCuerpo, fontCuerpoBold);
                    document.add(pCuerpo);
                }
            }

            document.close();
        } catch (Exception e) {
            log.error("Error al generar el PDF del CV", e);
        }
        return out.toByteArray();
    }

    private void emitirCabecera(Document document, String nombre, List<String> contactos,
                                Font fontNombre, Font fontContacto) {
        PdfPTable tabla = new PdfPTable(1);
        tabla.setWidthPercentage(100f);

        PdfPCell celda = new PdfPCell();
        celda.setBorder(Rectangle.NO_BORDER);
        celda.setBackgroundColor(COLOR_PRIMARY);
        celda.setPaddingLeft(16);
        celda.setPaddingRight(16);
        celda.setPaddingTop(16);
        celda.setPaddingBottom(16);

        Paragraph pNombre = new Paragraph(nombre, fontNombre);
        pNombre.setSpacingAfter(contactos.isEmpty() ? 0 : 8);
        celda.addElement(pNombre);

        for (String contacto : contactos) {
            Paragraph pContacto = new Paragraph(contacto, fontContacto);
            pContacto.setSpacingAfter(2);
            celda.addElement(pContacto);
        }

        tabla.addCell(celda);
        document.add(tabla);

        Paragraph espacio = new Paragraph(" ");
        espacio.setLeading(4f);
        document.add(espacio);
    }

    private void addTextoConNegrita(Paragraph parrafo, String texto,
                                    Font fuenteNormal, Font fuenteNegrita) {
        String[] partes = texto.split("\\*\\*", -1);
        for (int i = 0; i < partes.length; i++) {
            if (partes[i].isEmpty()) {
                continue;
            }
            parrafo.add(new Chunk(partes[i], (i % 2 == 1) ? fuenteNegrita : fuenteNormal));
        }
    }

    private String limpiarMarkdown(String linea) {
        String limpia = linea.replaceFirst("^#{1,4}\\s*", "");
        limpia = limpia.replace("*", "");
        return limpia.trim();
    }

    private boolean esSubseccion(String linea) {
        return linea.startsWith("###");
    }

    private boolean esSeccion(String linea) {
        if (linea.startsWith("##")) {
            return true;
        }
        String limpia = limpiarMarkdown(linea);
        if (limpia.isEmpty()) {
            return false;
        }
        boolean esMayusculas = limpia.equals(limpia.toUpperCase());
        if (!esMayusculas) {
            return false;
        }
        boolean esCorta = limpia.length() <= 28;
        boolean palabraClave = SECCIONES_CLAVE.stream().anyMatch(limpia::contains);
        return (palabraClave || esCorta) && limpia.length() <= 40;
    }

    private boolean esBullet(String linea) {
        return linea.startsWith("-") || linea.startsWith("*") || linea.startsWith("•")
                || linea.startsWith("▪") || linea.startsWith("·");
    }

    private boolean esContacto(String linea) {
        String l = linea.toLowerCase();
        return l.startsWith("email") || l.startsWith("tel") || l.startsWith("phone")
                || l.startsWith("linkedin") || l.startsWith("github") || l.startsWith("web")
                || l.startsWith("ubicación") || l.startsWith("ubicacion")
                || l.startsWith("dirección") || l.startsWith("direccion")
                || l.startsWith("@") || l.startsWith("http")
                || l.matches("^[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}$");
    }

    private String limpiarContacto(String linea) {
        String limpia = limpiarMarkdown(linea);
        return limpia.replaceFirst("^(email|teléfono|telefono|phone|linkedin|github|web|ubicación|ubicacion|dirección|direccion|contacto)\\s*[:\\-]\\s*", "")
                .trim();
    }

    public String extraerTextoDocx(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }
}
