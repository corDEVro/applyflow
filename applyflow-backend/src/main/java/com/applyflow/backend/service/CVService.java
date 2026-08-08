// Esta clase se encarga de generar un PDF a partir del contenido del CV proporcionado por el usuario y de enviar un email con dicho PDF como adjunto. Utiliza la biblioteca OpenPDF para la generación del PDF y Spring Mail para el envío de correos electrónicos.

package com.applyflow.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
public class CVService {

    private static final Logger log = LoggerFactory.getLogger(CVService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String remitente;

    public byte[] generarPdfCv(String contenidoCv) {    // Método que genera un PDF a partir del contenido del CV. El contenido se espera en formato de texto con ciertas convenciones para identificar secciones, subsecciones y puntos clave. El PDF resultante tiene un diseño profesional con colores y estilos que mejoran la presentación del CV. El método devuelve el PDF como un arreglo de bytes, listo para ser adjuntado en un email o guardado en el sistema.
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 60, 60);
        
        try {   // Configuración del documento PDF y definición de estilos para el nombre, secciones, cuerpo del texto y bullets.
            PdfWriter.getInstance(document, out);
            document.open();
            
            Color colorPrimario = new Color(30, 41, 59);
            Color colorSecundario = new Color(2, 132, 199);
            Color colorTexto = new Color(71, 85, 105);

            Font fontNombre = new Font(Font.HELVETICA, 24, Font.BOLD, colorPrimario);
            Font fontSeccion = new Font(Font.HELVETICA, 14, Font.BOLD, colorSecundario);
            Font fontCuerpo = new Font(Font.HELVETICA, 10, Font.NORMAL, colorTexto);
            Font fontBullet = new Font(Font.HELVETICA, 10, Font.BOLD, colorSecundario);

            LineSeparator lineaDivisoria = new LineSeparator(1f, 100f, colorSecundario, Element.ALIGN_CENTER, -2);

            String[] lineas = contenidoCv.split("\n");
            boolean esPrimeraLinea = true;

            for (String linea : lineas) {   // Procesamiento de cada línea del contenido del CV para determinar su formato y estilo en el PDF. Se identifican el nombre (primera línea), secciones (líneas que comienzan con "##" o terminan con ":"), bullets (líneas que comienzan con "-" o "*") y el cuerpo del texto. Cada tipo de línea se formatea de manera diferente para mejorar la presentación del CV.
                linea = linea.trim();
                if (linea.isEmpty()) continue;

                if (esPrimeraLinea) {
                    Paragraph pNombre = new Paragraph(linea.replace("#", ""), fontNombre);
                    pNombre.setSpacingAfter(15);
                    document.add(pNombre);
                    esPrimeraLinea = false;
                    continue;
                }

                if (linea.startsWith("##") || linea.matches("^[A-ZÁÉÍÓÚÑ\\s]{4,20}:$") || linea.endsWith(":")) {
                    String textoSeccion = linea.replace("#", "").replace(":", "").trim().toUpperCase();
                    
                    Paragraph pSeccion = new Paragraph("\n" + textoSeccion, fontSeccion);
                    pSeccion.setSpacingBefore(10);
                    pSeccion.setSpacingAfter(4);
                    document.add(pSeccion);
                    document.add(lineaDivisoria);
                    
                    Paragraph espacio = new Paragraph(" ");
                    espacio.setLeading(6f);
                    document.add(espacio);
                    continue;
                }

                if (linea.startsWith("-") || linea.startsWith("*")) {
                    String textoBullet = linea.substring(1).trim();
                    
                    Paragraph pBullet = new Paragraph();
                    pBullet.setIndentationLeft(15);
                    pBullet.setSpacingAfter(3);
                    pBullet.setLeading(14f);
                    
                    pBullet.add(new Chunk("▪ ", fontBullet));
                    pBullet.add(new Chunk(textoBullet, fontCuerpo));
                    
                    document.add(pBullet);
                    continue;
                }

                Paragraph pCuerpo = new Paragraph(linea, fontCuerpo);
                pCuerpo.setSpacingAfter(6);
                pCuerpo.setLeading(14f);
                document.add(pCuerpo);
            }
            
            document.close();
        } catch (Exception e) {
            log.error("Error al generar el PDF del CV", e);
        }
        return out.toByteArray();
    }

    public void enviarCandidatura(String destinatario, String cuerpoEmail, String contenidoCv) throws Exception {   // Método que envía un email con el PDF del CV como adjunto. El email se envía al destinatario especificado, con un asunto predefinido y un cuerpo de texto que puede incluir información adicional sobre la candidatura. El PDF del CV se genera a partir del contenido proporcionado y se adjunta al email utilizando Spring Mail. Si ocurre algún error durante el proceso de envío, se lanza una excepción.
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(remitente);
        helper.setTo(destinatario);
        helper.setSubject("Candidatura para el puesto - Currículum y Carta de Presentación");
        helper.setText(cuerpoEmail, false);
        
        byte[] pdfBytes = generarPdfCv(contenidoCv);
        helper.addAttachment("CV_Adaptado.pdf", new ByteArrayResource(pdfBytes));
        
        mailSender.send(message);
    }
}